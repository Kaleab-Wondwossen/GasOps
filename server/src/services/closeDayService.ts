import mongoose from "mongoose";
import Decimal from "decimal.js";
import { DailySaleModel } from "../models/DailySale";
import { applySaleDeduction } from "./stockService";

/**
 * Close a day for a station:
 * - only closes records with status=draft
 * - deducts stock for each fuel present
 * - locks records (status=closed, stamps closedBy/At)
 * Idempotent: if already closed, returns current state.
 */
export async function closeDay(
  user: { id:string, role:string, stationId:string },
  stationId: string,
  date: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // load both fuels for the date
    const docs = await DailySaleModel.find({ stationId, date }).session(session).lean();
    if (docs.length === 0) throw new Error("No day records to close");

    // close each draft doc: deduct stock and mark closed
    const results: any[] = [];
    for (const d of docs) {
      if (d.status === "closed") { results.push(d); continue; }

      const liters = new Decimal(d.litersSold || "0").toFixed(3);
      if (new Decimal(liters).lt(0)) throw new Error("Invalid litersSold");

      // Deduct stock (atomic feel via session)
      await applySaleDeduction(stationId, d.fuel, liters);

      // Mark closed & persist litersDeducted snapshot
      const updated = await DailySaleModel.findOneAndUpdate(
        { stationId, date, fuel: d.fuel },
        {
          status: "closed",
          closedAt: new Date(),
          closedBy: user.id,
          litersDeducted: liters
        },
        { new: true, session }
      ).lean();

      results.push(updated);
    }

    await session.commitTransaction();
    return { ok:true, stationId, date, closed: results };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

/**
 * Reopen a closed day (admin only):
 * - restores stock by ADDING back litersDeducted for each fuel
 * - sets status=draft so it can be edited/closed again
 * - appends reopenHistory entry
 */
export async function reopenDay(
  user: { id:string, role:string, stationId:string },
  stationId: string,
  date: string,
  reason: string
) {
  if (user.role !== "admin") throw new Error("Admin only");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const docs = await DailySaleModel.find({ stationId, date, status:"closed" }).session(session);
    if (docs.length === 0) throw new Error("No closed records found for this date");

    // reverse stock deduction for each closed record
    for (const d of docs) {
      const liters = new Decimal(d.litersDeducted || d.litersSold || "0");
      if (liters.gt(0)) {
        // add back to stock (reverse of deduction)
        const Stock = (await import("../models/Stock")).StockModel;
        const stock = await Stock.findOne({ stationId, fuel: d.fuel }).session(session);
        if (!stock) throw new Error(`Stock not initialized for ${d.fuel}`);
        stock.currentLitres = new Decimal(stock.currentLitres).plus(liters).toFixed(3);
        stock.updatedAt = new Date();
        await stock.save({ session });
      }

      d.status = "draft";
      d.reopenHistory = d.reopenHistory || [];
      d.reopenHistory.push({ reopenedAt: new Date(), reopenedBy: user.id, reason });
      d.closedAt = null;
      d.closedBy = null;
      d.litersDeducted = null;

      await d.save({ session });
    }

    await session.commitTransaction();
    return { ok:true, stationId, date, reopened: docs.map(x => x.toJSON()) };
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

import { StockModel } from "../models/Stock";
import { StockDeliveryModel } from "../models/StockDelivery";
import Decimal from "decimal.js";

export async function getStock(stationId: string) {
  const rows = await StockModel.find({ stationId }).sort({ fuel: 1 }).lean();
  return rows.map(s => ({
    ...s,
    low:
      new Decimal(s.currentLitres)
        .div(s.capacityLitres)
        .lt(new Decimal(s.lowThresholdPct).div(100))
  }));
}

export async function initOrUpdateStock(payload: {
  stationId: string;
  fuel: "benzene" | "gasoil";
  capacityLitres: string;
  currentLitres: string;
  lowThresholdPct?: number;
}) {
  const doc = await StockModel.findOneAndUpdate(
    { stationId: payload.stationId, fuel: payload.fuel },
    { ...payload, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc.toJSON();
}

export async function recordDelivery(
  user: { id: string },
  payload: { stationId: string; fuel: "benzene" | "gasoil"; litresDelivered: string; reference?: string }
) {
  await StockDeliveryModel.create({ ...payload, createdBy: user.id });
  const stock = await StockModel.findOne({ stationId: payload.stationId, fuel: payload.fuel });
  if (!stock) throw new Error("Stock not initialized");

  stock.currentLitres = new Decimal(stock.currentLitres)
    .plus(payload.litresDelivered)
    .toFixed(3);
  stock.updatedAt = new Date();
  await stock.save();
  return stock.toJSON();
}

// for later (close-day)
export async function applySaleDeduction(
  stationId: string, fuel: "benzene" | "gasoil", litresSold: string
) {
  const stock = await StockModel.findOne({ stationId, fuel });
  if (!stock) throw new Error("Stock not initialized");
  const after = new Decimal(stock.currentLitres).minus(litresSold);
  if (after.isNegative()) throw new Error("Insufficient stock (would go negative)");
  stock.currentLitres = after.toFixed(3);
  stock.updatedAt = new Date();
  await stock.save();
  return stock.toJSON();
}

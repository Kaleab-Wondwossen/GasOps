// src/services/dayService.ts
import { DailySaleModel } from "../models/DailySale";
import { computeBenzeneSingle } from "./compute/benzeneSingle";
import { computeGasoilTiers } from "./compute/gasoilTiers";
import { sumPayments } from "../utils/validate";
import { getActiveTariff } from "./tariffService";

type UserCtx = { id: string };

// helper: normalize to decimal strings (avoids Decimal(undefined) errors)
const nz = (v: any): string => (v ?? "0").toString();

// helper: normalize payments object
function normalizePayments(p: any) {
  return {
    cash: nz(p?.cash),
    telebirr: nz(p?.telebirr),
    transfer: nz(p?.transfer),
    cheque: nz(p?.cheque),
    coupon: nz(p?.coupon),
  };
}

// helper: normalize tiers array
function normalizeTiers(arr: any) {
  const raw = Array.isArray(arr) ? arr : [];
  return raw.map((t) => ({
    price: nz(t?.price),
    litres: nz(t?.litres),
  }));
}

export async function upsertDay(user: UserCtx, payload: any) {
  // 1) Prefill from tariff history if baseTariff is missing
  if (!payload.baseTariff) {
    const t = await getActiveTariff(payload.stationId, payload.fuel, payload.date);
    if (!t) {
      throw new Error(
        "No active tariff for date; provide baseTariff in payload or create a tariff first"
      );
    }
    payload.baseTariff = t.baseTariff;

    // benzene extra-per-litre snapshot if not provided
    if (payload.fuel === "benzene" && !payload.benzeneExtraPerLitre && t.benzeneExtraPerLitre) {
      payload.benzeneExtraPerLitre = t.benzeneExtraPerLitre;
    }

    // optional: seed gasoil allowed tiers as hint (litres still come from client)
    if (payload.fuel === "gasoil" && !payload.tiers && Array.isArray(t.gasoilTiers)) {
      payload.tiers = []; // we only compute from actual litres provided by client
    }
  }

  // 2) Normalize numeric fields to safe strings
  payload.meterAM = nz(payload.meterAM);
  payload.meterPM = nz(payload.meterPM);
  payload.rolloverMax = payload.rolloverMax ? nz(payload.rolloverMax) : undefined;

  payload.baseTariff = nz(payload.baseTariff);
  payload.creditsGiven = nz(payload.creditsGiven);
  payload.creditPayments = nz(payload.creditPayments);
  payload.expenses = nz(payload.expenses);
  payload.payments = normalizePayments(payload.payments);

  if (payload.fuel === "benzene") {
    // Map field name that compute expects
    payload.extraPerLitre = nz(payload.extraPerLitre ?? payload.benzeneExtraPerLitre);
  } else if (payload.fuel === "gasoil") {
    payload.tiers = normalizeTiers(payload.tiers);
  }

  // 3) Decide compute
  let computed: any;
  if (payload.fuel === "benzene" && payload.pricingMode === "benzene-single") {
    computed = computeBenzeneSingle(payload);
  } else if (payload.fuel === "gasoil" && payload.pricingMode === "gasoil-tiers") {
    computed = computeGasoilTiers(payload);
  } else {
    throw new Error("Unsupported fuel/pricingMode");
  }

  // 4) Server-truth totalPayments (avoids client-side mismatch)
  const totalPayments = sumPayments(payload.payments);

  // 5) Upsert (draft)
  const doc = await DailySaleModel.findOneAndUpdate(
    { stationId: payload.stationId, date: payload.date, fuel: payload.fuel },
    {
      ...payload,
      totalPayments,
      ...computed,
      updatedBy: user?.id ?? "system",
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return doc.toJSON();
}

export async function getDay(stationId: string, date: string) {
  return DailySaleModel.find({ stationId, date }).sort({ fuel: 1 }).lean();
}

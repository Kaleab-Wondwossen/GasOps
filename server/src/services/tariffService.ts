import { TariffModel } from "../models/Tariff";

export async function createTariff(user: { id: string }, payload: {
  stationId: string;
  fuel: "benzene" | "gasoil";
  baseTariff: string;
  benzeneExtraPerLitre?: string;
  gasoilTiers?: { price: string; deltaFromBase: string }[];
  validFrom: string; // ISO date (YYYY-MM-DD)
  validTo?: string | null; // ISO date or null
}) {
  // Optional: automatically close previous open-ended tariff
  if (!payload.validTo) {
    // leave open-ended; alternatively, you could auto-close previous with validTo = validFrom
  }

  const doc = await TariffModel.create({
    ...payload,
    validFrom: new Date(payload.validFrom),
    validTo: payload.validTo ? new Date(payload.validTo) : undefined,
    createdBy: user.id
  });
  return doc.toJSON();
}

export async function listTariffs(stationId: string, fuel?: "benzene" | "gasoil") {
  const q: any = { stationId };
  if (fuel) q.fuel = fuel;
  return TariffModel.find(q).sort({ fuel: 1, validFrom: -1 }).lean();
}

/**
 * Find the active tariff for a given date:
 * validFrom <= date < validTo (or validTo null).
 */
export async function getActiveTariff(stationId: string, fuel: "benzene" | "gasoil", dateISO: string) {
  const dt = new Date(dateISO);
  const rows = await TariffModel.find({
    stationId, fuel,
    validFrom: { $lte: dt },
    $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gt: dt } }]
  }).sort({ validFrom: -1 }).limit(1).lean();

  return rows[0] || null;
}

import { Schema, model } from "mongoose";

const TierSchema = new Schema({ price: String, deltaFromBase: String }, { _id: false });

const TariffSchema = new Schema({
  stationId: { type: String, index: true, required: true },
  fuel: { type: String, enum: ["benzene","gasoil"], index: true, required: true },

  baseTariff: { type: String, required: true },                 // Decimal string
  benzeneExtraPerLitre: { type: String },                       // optional: for single-rate days
  gasoilTiers: { type: [TierSchema], default: [] },             // optional catalog of allowed tiers

  validFrom: { type: Date, required: true },                    // inclusive
  validTo:   { type: Date },                                    // exclusive (null = open-ended)

  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

TariffSchema.index({ stationId:1, fuel:1, validFrom:1 });

export const TariffModel = model("Tariff", TariffSchema);

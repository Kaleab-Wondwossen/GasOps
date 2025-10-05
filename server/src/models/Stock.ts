import { Schema, model } from "mongoose";

const StockSchema = new Schema({
  stationId: { type: String, index: true, required: true },
  fuel: { type: String, enum: ["benzene","gasoil"], index: true, required: true },
  capacityLitres: { type: String, required: true }, // Decimal as string
  currentLitres:  { type: String, required: true }, // Decimal as string
  lowThresholdPct:{ type: Number, default: 10 },
  updatedAt: { type: Date, default: Date.now }
});

StockSchema.index({ stationId:1, fuel:1 }, { unique: true });

export const StockModel = model("Stock", StockSchema);

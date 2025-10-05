import { Schema, model } from "mongoose";

const StockDeliverySchema = new Schema({
  stationId: { type: String, index: true, required: true },
  fuel: { type: String, enum: ["benzene","gasoil"], index: true, required: true },
  litresDelivered: { type: String, required: true }, // Decimal as string
  reference: { type: String },
  deliveredAt: { type: Date, default: Date.now },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

export const StockDeliveryModel = model("StockDelivery", StockDeliverySchema);

import { Schema, model } from "mongoose";

// Store a hashed code + TTL index for auto-expiry
const OtpCodeSchema = new Schema({
  phone: { type: String, index: true, required: true },
  codeHash: { type: String, required: true },
  purpose: { type: String, enum: ["login"], default: "login" },
  attempts: { type: Number, default: 0 },
  cooldownUntil: { type: Date },  // for resend cooldown
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});

// TTL index
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpCodeModel = model("OtpCode", OtpCodeSchema);

import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  phone: { type: String, unique: true, required: true, index: true },
  displayName: { type: String },
  role: { type: String, enum: ["admin","staff"], default: "staff" },
  stationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
});

export const UserModel = model("User", UserSchema);

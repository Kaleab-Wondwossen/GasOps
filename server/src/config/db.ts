import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  // Good defaults for Atlas
  await mongoose.connect(env.MONGO_URI, {
    // mongoose v8 uses modern defaults; options kept minimal
  } as any);

  mongoose.connection.on("connected", () => {
    console.log("[db] connected:", mongoose.connection.name);
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
}

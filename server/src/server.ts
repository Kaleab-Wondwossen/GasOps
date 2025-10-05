import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function boot() {
  try {
    if (!env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`[${env.APP_NAME}] listening on :${env.PORT} (${env.NODE_ENV})`);
    });

    // graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down...`);
      server.close(async () => {
        await (await import("mongoose")).default.disconnect();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (e) {
    console.error("Boot failure:", e);
    process.exit(1);
  }
}

boot();

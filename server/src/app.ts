import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import mongoose from "mongoose";
import computeRoutes from "./routes/compute.routes";
import dayRoutes from "./routes/day.routes";
import stockRoutes from "./routes/stock.routes";
import tariffRoutes from "./routes/tariff.routes";
import authRoutes from "./routes/auth.routes";
import closeDayRoutes from "./routes/closeDay.routes";
import reportRoutes from "./routes/report.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api", dayRoutes);
app.use("/api", stockRoutes);
app.use("/api", tariffRoutes);
app.use("/api", authRoutes);
app.use("/api", closeDayRoutes);
app.use("/api", reportRoutes);


app.get("/health", (_req, res) => {
  const state = mongoose.connection.readyState; // 0,1,2,3
  res.json({ ok: state === 1, dbState: state, app: env.APP_NAME, env: env.NODE_ENV, ts: new Date().toISOString() });
});

app.use("/api", computeRoutes);

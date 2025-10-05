import { Router } from "express";
import { postTariff, getTariffs, getActiveTariffCtrl } from "../controllers/tariff.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const r = Router();

// Read endpoints: staff+ (you can allow viewer if you add that role)
r.get("/tariff", requireAuth, getTariffs);
r.get("/tariff/active", requireAuth, getActiveTariffCtrl);

// Create/modify tariffs: admin only
r.post("/tariff", requireAuth, requireRole("admin"), postTariff);

export default r;

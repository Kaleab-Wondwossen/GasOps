import { Router } from "express";
import { getStockCtrl, postStockInit, postStockDelivery } from "../controllers/stock.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const r = Router();

// Anyone logged-in can read stock
r.get("/stock", requireAuth, getStockCtrl);

// Mutations require staff or above
r.post("/stock/init", requireAuth, requireRole("staff"), postStockInit);
r.post("/stock/delivery", requireAuth, requireRole("staff"), postStockDelivery);

export default r;

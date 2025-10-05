// src/routes/day.routes.ts
import { Router } from "express";
import { postDay, getDayByDate } from "../controllers/day.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const r = Router();
r.get("/day", requireAuth, getDayByDate);                 // read
r.post("/day", requireAuth, requireRole("staff"), postDay); // write
export default r;

import { Router } from "express";
import { postCloseDay, postReopenDay } from "../controllers/closeDay.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const r = Router();
r.post("/day/close",  requireAuth, requireRole("staff"), postCloseDay);
r.post("/day/reopen", requireAuth, requireRole("admin"), postReopenDay);

export default r;

import { Router } from "express";
import { getReportSummary, getReportDaily, getDashboardToday } from "../controllers/report.controller";
import { requireAuth } from "../middleware/auth";

const r = Router();
r.get("/report/summary", requireAuth, getReportSummary);
r.get("/report/daily", requireAuth, getReportDaily);
r.get("/dashboard/today", requireAuth, getDashboardToday);

export default r;

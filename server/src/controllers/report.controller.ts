import { Request, Response } from "express";
import { overviewTotals, summaryByDate, dashboardToday } from "../services/reportingService";

export async function getReportSummary(req: Request, res: Response) {
  const { stationId, from, to } = req.query as any;
  if (!stationId || !from || !to) return res.status(400).json({ error:"stationId, from, to required (YYYY-MM-DD)" });
  try {
    const out = await overviewTotals(stationId, { from, to });
    res.json(out);
  } catch (e:any) {
    res.status(400).json({ error: String(e.message||e) });
  }
}

export async function getReportDaily(req: Request, res: Response) {
  const { stationId, from, to } = req.query as any;
  if (!stationId || !from || !to) return res.status(400).json({ error:"stationId, from, to required" });
  try {
    const rows = await summaryByDate(stationId, { from, to });
    res.json(rows);
  } catch (e:any) {
    res.status(400).json({ error: String(e.message||e) });
  }
}

export async function getDashboardToday(req: Request, res: Response) {
  const { stationId, date } = req.query as any;
  if (!stationId || !date) return res.status(400).json({ error:"stationId, date required" });
  try {
    const out = await dashboardToday(stationId, date);
    res.json(out);
  } catch (e:any) {
    res.status(400).json({ error: String(e.message||e) });
  }
}

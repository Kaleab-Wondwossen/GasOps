import { Request, Response } from "express";
import { closeDay, reopenDay } from "../services/closeDayService";

export async function postCloseDay(req: Request, res: Response) {
  const { stationId, date } = req.body || {};
  if (!stationId || !date) return res.status(400).json({ error:"stationId and date required" });
  try {
    const user = (req as any).user;
    const out = await closeDay(user, stationId, date);
    res.json(out);
  } catch (e:any) {
    res.status(400).json({ error: String(e.message||e) });
  }
}

export async function postReopenDay(req: Request, res: Response) {
  const { stationId, date, reason } = req.body || {};
  if (!stationId || !date || !reason) return res.status(400).json({ error:"stationId, date, reason required" });
  try {
    const user = (req as any).user;
    const out = await reopenDay(user, stationId, date, reason);
    res.json(out);
  } catch (e:any) {
    res.status(400).json({ error: String(e.message||e) });
  }
}

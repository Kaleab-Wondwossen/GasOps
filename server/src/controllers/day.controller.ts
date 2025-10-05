import { Request, Response } from "express";
import { upsertDay, getDay } from "../services/dayService";
import { requireKeys } from "../utils/validate";

export async function postDay(req: Request, res: Response) {
  const need = ["stationId","date","fuel","pricingMode","meterAM","meterPM","payments"];
  const err = requireKeys(req.body, need);
  if (err) return res.status(400).json({ error: err });

  try {
    const user = (req as any).user; // <-- real user now
    const result = await upsertDay(user, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

export async function getDayByDate(req: Request, res: Response) {
  const { stationId, date } = req.query as any;
  if (!stationId || !date) return res.status(400).json({ error: "stationId and date are required" });
  try { res.json(await getDay(stationId, date)); }
  catch (e: any) { res.status(400).json({ error: String(e.message || e) }); }
}

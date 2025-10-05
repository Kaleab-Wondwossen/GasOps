import { Request, Response } from "express";
import { createTariff, listTariffs, getActiveTariff } from "../services/tariffService";

export async function postTariff(req: Request, res: Response) {
  try {
    const user = (req as any).user; // role checked by requireRole("admin")
    const doc = await createTariff(user, req.body);
    res.json(doc);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

export async function getTariffs(req: Request, res: Response) {
  const { stationId, fuel } = req.query as any;
  if (!stationId) return res.status(400).json({ error: "stationId required" });
  try { res.json(await listTariffs(stationId, fuel)); }
  catch (e: any) { res.status(400).json({ error: String(e.message || e) }); }
}

export async function getActiveTariffCtrl(req: Request, res: Response) {
  const { stationId, fuel, date } = req.query as any;
  if (!stationId || !fuel || !date) return res.status(400).json({ error: "stationId, fuel, date required" });
  try {
    const t = await getActiveTariff(stationId, fuel, date);
    if (!t) return res.status(404).json({ error: "No active tariff for date" });
    res.json(t);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

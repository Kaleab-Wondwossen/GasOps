import { Request, Response } from "express";
import { getStock, initOrUpdateStock, recordDelivery } from "../services/stockService";

export async function getStockCtrl(req: Request, res: Response) {
  const { stationId } = req.query as any;
  if (!stationId) return res.status(400).json({ error: "stationId required" });
  try { res.json(await getStock(stationId)); }
  catch (e: any) { res.status(400).json({ error: String(e.message || e) }); }
}

export async function postStockInit(req: Request, res: Response) {
  try {
    // optional: enforce user.stationId === payload.stationId if you want scoping
    const user = (req as any).user; // { id, phone, role, stationId }
    // you can stamp createdBy/updatedBy here if your model has those fields
    res.json(await initOrUpdateStock(req.body));
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

export async function postStockDelivery(req: Request, res: Response) {
  try {
    const user = (req as any).user; // <-- real JWT user
    const updated = await recordDelivery(user, req.body);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

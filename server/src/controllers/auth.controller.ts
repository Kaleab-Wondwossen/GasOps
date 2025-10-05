import { Request, Response } from "express";
import { requestOtp, verifyOtp } from "../services/authService";

export async function postOtpRequest(req: Request, res: Response) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });
    const x = await requestOtp({ phone });
    res.json(x);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

export async function postOtpVerify(req: Request, res: Response) {
  try {
    const { phone, code, stationId, displayName } = req.body;
    if (!phone || !code || !stationId) return res.status(400).json({ error: "phone, code, stationId required" });
    const x = await verifyOtp({ phone, code, stationId, displayName });
    res.json(x);
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
}

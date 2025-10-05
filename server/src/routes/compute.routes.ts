import { Router } from "express";
import { computeBenzeneSingle } from "../services/compute/benzeneSingle";
import { computeGasoilTiers } from "../services/compute/gasoilTiers";

const r = Router();

// (Optional) Tiny input guard
function reqOk(body: any, keys: string[]) {
  for (const k of keys) if (!(k in body)) return `Missing field: ${k}`;
  return null;
}

r.post("/compute/benzene", (req, res) => {
  const err = reqOk(req.body, [
    "meterAM", "meterPM", "baseTariff", "extraPerLitre",
    "creditsGiven", "creditPayments", "expenses", "payments"
  ]);
  if (err) return res.status(400).json({ error: err });
  try {
    return res.json(computeBenzeneSingle(req.body));
  } catch (e: any) {
    return res.status(400).json({ error: String(e.message || e) });
  }
});

r.post("/compute/gasoil", (req, res) => {
  const err = reqOk(req.body, [
    "meterAM", "meterPM", "baseTariff", "tiers",
    "creditsGiven", "creditPayments", "expenses", "payments"
  ]);
  if (err) return res.status(400).json({ error: err });
  try {
    return res.json(computeGasoilTiers(req.body));
  } catch (e: any) {
    return res.status(400).json({ error: String(e.message || e) });
  }
});

export default r;

import { DM, round2, round3 } from "../../utils/decimals";

type Tier = { price: string; litres: string; };
type Payments = { cash: string; telebirr: string; transfer: string; cheque: string; coupon: string; };

export function computeGasoilTiers(p: {
  meterAM: string; meterPM: string; rolloverMax?: string;
  baseTariff: string; tiers: Tier[];
  creditsGiven: string; creditPayments: string; expenses: string;
  payments: Payments;
}) {
  const am = DM(p.meterAM), pm = DM(p.meterPM);

  const L = p.rolloverMax && pm.lessThan(am)
    ? DM(p.rolloverMax).minus(am).plus(pm)
    : pm.minus(am);

  const baseSales = DM(p.baseTariff).times(L);

  let extra = DM(0), tierSum = DM(0);
  for (const t of p.tiers) {
    extra = extra.plus(DM(t.price).minus(p.baseTariff).times(t.litres));
    tierSum = tierSum.plus(t.litres);
  }

  const adj = DM(p.creditPayments).minus(p.creditsGiven).minus(p.expenses);
  const netBase = baseSales.plus(adj);
  const expected = netBase.plus(extra);

  const sumPay = DM(p.payments.cash)
    .plus(p.payments.telebirr)
    .plus(p.payments.transfer)
    .plus(p.payments.cheque)
    .plus(p.payments.coupon);

  const delta = sumPay.minus(expected);
  const totalRevenue = baseSales.plus(extra);

  const result = {
    litersSold: round3(L).toString(),
    baseSales: round2(baseSales).toString(),
    extraRevenue: round2(extra).toString(),
    adjustments: round2(adj).toString(),
    netBase: round2(netBase).toString(),
    expected: round2(expected).toString(),
    profitOrDelta: round2(delta).toString(),
    totalRevenue: round2(totalRevenue).toString(),
    warnings: [] as string[],
  };

  if (tierSum.minus(L).gt(0.001)) result.warnings.push("Tier litres exceed total liters sold");
  if (delta.abs().gt(1)) result.warnings.push(`Payments mismatch expected by ${result.profitOrDelta}`);

  return result;
}

import { DM, round2, round3 } from "../../utils/decimals";

type Payments = { cash: string; telebirr: string; transfer: string; cheque: string; coupon: string; };

export function computeBenzeneSingle(p: {
  meterAM: string; meterPM: string; rolloverMax?: string;
  baseTariff: string; extraPerLitre: string;
  creditsGiven: string; creditPayments: string; expenses: string;
  payments: Payments;
}) {
  const am = DM(p.meterAM), pm = DM(p.meterPM);

  const L = p.rolloverMax && pm.lessThan(am)
    ? DM(p.rolloverMax).minus(am).plus(pm)
    : pm.minus(am);

  const sumPay = DM(p.payments.cash)
    .plus(p.payments.telebirr)
    .plus(p.payments.transfer)
    .plus(p.payments.cheque)
    .plus(p.payments.coupon);

  const baseSales = DM(p.baseTariff).times(L);
  const adj = DM(p.creditPayments).minus(p.creditsGiven).minus(p.expenses);
  const netBase = baseSales.plus(adj);
  const profit = sumPay.minus(netBase);

  const addLitres = DM(p.extraPerLitre).gt(0) ? profit.div(p.extraPerLitre) : DM(0);
  const totalRevenue = baseSales.plus(addLitres.times(p.extraPerLitre));

  const result = {
    litersSold: round3(L).toString(),
    baseSales: round2(baseSales).toString(),
    adjustments: round2(adj).toString(),
    netBase: round2(netBase).toString(),
    profitOrDelta: round2(profit).toString(),
    additionalLitres: round3(addLitres).toString(),
    totalRevenue: round2(totalRevenue).toString(),
    warnings: [] as string[],
  };

  if (DM(result.additionalLitres).minus(result.litersSold).gt(0.001)) {
    result.warnings.push("Extra litres exceed liters sold");
  }
  if (DM(result.profitOrDelta).lt(-1)) {
    result.warnings.push("Payments less than expected base");
  }
  return result;
}

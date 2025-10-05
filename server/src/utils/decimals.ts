import Decimal from "decimal.js";

export const DM = (n: string | number) => new Decimal(n);
export const round2 = (n: Decimal.Value) =>
  new Decimal(n).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
export const round3 = (n: Decimal.Value) =>
  new Decimal(n).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

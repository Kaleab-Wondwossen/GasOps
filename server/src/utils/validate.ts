export function requireKeys(obj: any, keys: string[]) {
  for (const k of keys) if (!(k in obj)) return `Missing field: ${k}`;
  return null;
}
export function sumPayments(p: any) {
  const n = (x: any) => Number(x ?? 0);
  return (n(p.cash)+n(p.telebirr)+n(p.transfer)+n(p.cheque)+n(p.coupon)).toFixed(2);
}

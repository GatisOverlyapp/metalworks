export function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

export function fmtEur(n: number): string {
  return n.toFixed(2) + " €";
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(0) + "%";
}

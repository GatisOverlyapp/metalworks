/** Format number as EUR currency */
export function formatEUR(value: number): string {
  return new Intl.NumberFormat("lv-LV", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format number with 2 decimal places */
export function formatNum(value: number, decimals = 2): string {
  return new Intl.NumberFormat("lv-LV", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format percentage */
export function formatPct(value: number): string {
  return `${formatNum(value, 1)}%`;
}

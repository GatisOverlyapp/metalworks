/**
 * Summary / totals calculation engine.
 * Discount capped at 23%, VAT 21%.
 */

export interface EstimateSummaryInput {
  totalMaterialsCost: number;
  totalProductionCost: number;
  totalDeliveryCost: number;
  discount: number; // percentage (0-23)
  vatRate: number;  // percentage (default 21)
}

export interface EstimateSummary {
  totalBeforeDiscount: number;
  discountAmount: number;
  totalBeforeVat: number;
  vatAmount: number;
  totalWithVat: number;
  effectiveDiscount: number; // capped discount
}

export function calcEstimateSummary(input: EstimateSummaryInput): EstimateSummary {
  const { totalMaterialsCost, totalProductionCost, totalDeliveryCost, discount, vatRate } = input;

  const totalBeforeDiscount = round2(totalMaterialsCost + totalProductionCost + totalDeliveryCost);

  // Cap discount at 23%
  const effectiveDiscount = Math.min(Math.max(discount, 0), 23);
  const discountAmount = round2(totalBeforeDiscount * (effectiveDiscount / 100));

  const totalBeforeVat = round2(totalBeforeDiscount - discountAmount);

  const vatAmount = round2(totalBeforeVat * (vatRate / 100));
  const totalWithVat = round2(totalBeforeVat + vatAmount);

  return {
    totalBeforeDiscount,
    discountAmount,
    totalBeforeVat,
    vatAmount,
    totalWithVat,
    effectiveDiscount,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

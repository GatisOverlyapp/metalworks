// Production & delivery cost calculations with auto-linking

import type { MaterialSummary } from "./summary";

export interface CostLineInput {
  id: string;
  section: string;
  category: string;
  lineKey: string;
  label: string;
  quantity: number;
  rate: number;
  unit: string;
  autoLinked: boolean;
  isCorrection: boolean;
  sortOrder: number;
}

export interface CostLineCalc extends CostLineInput {
  computedQuantity: number;
  lineCost: number;
}

export interface ProductionResult {
  lines: CostLineCalc[];
  productionTotal: number;
  discountAmount: number;
  netProduction: number;
  perUnitProduction: number;
  vatAmount: number;
  totalWithVat: number;
}

export interface DeliveryResult {
  lines: CostLineCalc[];
  deliveryTotal: number;
  discountAmount: number;
  netDelivery: number;
  vatAmount: number;
  totalWithVat: number;
}

function roundUp2(n: number): number {
  return Math.ceil(n * 100) / 100;
}

function getAutoLinkedQuantity(lineKey: string, summary: MaterialSummary): number | null {
  switch (lineKey) {
    case "weld_workshop":
      return summary.totalWeldingHours;
    case "metal_workshop":
      return summary.totalProcessingHours;
    case "qc_production":
      // 5% of all production hours (welding + processing)
      return (summary.totalWeldingHours + summary.totalProcessingHours) * 0.05;
    case "sandblast_m2":
    case "coat_primer":
    case "coat_topcoat":
      return summary.totalSurfaceArea;
    case "mat_main":
      return summary.totalMaterialCost * 1.3;
    case "mat_auxiliary":
      return summary.totalAuxiliaryCost * 1.3;
    default:
      return null;
  }
}

function calcLines(
  lines: CostLineInput[],
  summary: MaterialSummary
): CostLineCalc[] {
  return lines.map((line) => {
    let computedQuantity = line.quantity;

    if (line.autoLinked) {
      const auto = getAutoLinkedQuantity(line.lineKey, summary);
      if (auto !== null) {
        computedQuantity = auto;
      }
    }

    // For materials lines (mat_main, mat_auxiliary), rate is a multiplier
    // The auto-linked quantity already includes the markup, so rate=1 for cost
    let lineCost: number;
    if (line.lineKey === "mat_main" || line.lineKey === "mat_auxiliary") {
      lineCost = line.autoLinked ? roundUp2(computedQuantity) : roundUp2(computedQuantity * line.rate);
    } else {
      lineCost = roundUp2(computedQuantity * line.rate);
    }

    return {
      ...line,
      computedQuantity,
      lineCost,
    };
  });
}

export function calcProduction(
  costLines: CostLineInput[],
  summary: MaterialSummary,
  discount: number,
  jobQuantity: number
): ProductionResult {
  const productionLines = costLines.filter((l) => l.section === "production");
  const lines = calcLines(productionLines, summary);

  const productionTotal = lines.reduce((sum, l) => sum + l.lineCost, 0);

  // Discount applies to production total (max 23%)
  const clampedDiscount = Math.min(Math.max(discount, 0), 0.23);
  const discountAmount = roundUp2(productionTotal * clampedDiscount);
  const netProduction = roundUp2(productionTotal - discountAmount);
  const perUnitProduction = jobQuantity > 0 ? roundUp2(netProduction / jobQuantity) : 0;
  const vatAmount = roundUp2(netProduction * 0.21);
  const totalWithVat = roundUp2(netProduction + vatAmount);

  return {
    lines,
    productionTotal,
    discountAmount,
    netProduction,
    perUnitProduction,
    vatAmount,
    totalWithVat,
  };
}

export function calcDelivery(
  costLines: CostLineInput[],
  summary: MaterialSummary,
  discount: number
): DeliveryResult {
  const deliveryLines = costLines.filter((l) => l.section === "delivery");
  const lines = calcLines(deliveryLines, summary);

  const deliveryTotal = lines.reduce((sum, l) => sum + l.lineCost, 0);
  const clampedDiscount = Math.min(Math.max(discount, 0), 0.23);
  const discountAmount = roundUp2(deliveryTotal * clampedDiscount);
  const netDelivery = roundUp2(deliveryTotal - discountAmount);
  const vatAmount = roundUp2(netDelivery * 0.21);
  const totalWithVat = roundUp2(netDelivery + vatAmount);

  return {
    lines,
    deliveryTotal,
    discountAmount,
    netDelivery,
    vatAmount,
    totalWithVat,
  };
}

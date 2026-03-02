/**
 * Production cost calculation engine.
 * Fixes from original Excel:
 * - Quality control = 5% of ALL production hours (was 2%, was missing metalwork hours)
 * - All material rows included in production sums
 * - Materials markup clearly separated
 */

export interface ProductionLineInput {
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface ProductionSummary {
  totalProductionCost: number;
  totalWeldingCost: number;
  totalMetalworkCost: number;
  totalSurfaceCost: number;
  totalTransportCost: number;
  totalMaterialsMarkup: number;
  totalMechanismsCost: number;
  totalQualityCost: number;
  totalHours: number;
}

export function calcProductionLine(input: ProductionLineInput): number {
  return round2(input.quantity * input.unitPrice);
}

/**
 * Calculate quality control cost.
 * Fix: uses 5% (not 2%) of ALL production hours (welding + metalwork + surface).
 */
export function calcQualityControl(
  totalWeldingHours: number,
  totalMetalworkHours: number,
  totalSurfaceHours: number,
  avgHourlyRate: number
): number {
  const totalProductionHours = totalWeldingHours + totalMetalworkHours + totalSurfaceHours;
  return round2(totalProductionHours * 0.05 * avgHourlyRate);
}

export interface ProductionTotalsInput {
  lines: Array<{ category: string; quantity: number; unitPrice: number; totalCost: number }>;
  qualityControlCost: number;
}

export function calcProductionTotals(input: ProductionTotalsInput): ProductionSummary {
  const { lines, qualityControlCost } = input;

  let totalWeldingCost = 0;
  let totalMetalworkCost = 0;
  let totalSurfaceCost = 0;
  let totalTransportCost = 0;
  let totalMaterialsMarkup = 0;
  let totalMechanismsCost = 0;
  let totalHours = 0;

  for (const line of lines) {
    const cost = line.totalCost;
    switch (line.category) {
      case "welding":
        totalWeldingCost += cost;
        totalHours += line.quantity;
        break;
      case "metalwork":
        totalMetalworkCost += cost;
        totalHours += line.quantity;
        break;
      case "surface":
        totalSurfaceCost += cost;
        totalHours += line.quantity;
        break;
      case "transport":
        totalTransportCost += cost;
        break;
      case "materials":
        totalMaterialsMarkup += cost;
        break;
      case "mechanisms":
        totalMechanismsCost += cost;
        break;
    }
  }

  const totalProductionCost = round2(
    totalWeldingCost +
    totalMetalworkCost +
    totalSurfaceCost +
    totalTransportCost +
    totalMaterialsMarkup +
    totalMechanismsCost +
    qualityControlCost
  );

  return {
    totalProductionCost,
    totalWeldingCost: round2(totalWeldingCost),
    totalMetalworkCost: round2(totalMetalworkCost),
    totalSurfaceCost: round2(totalSurfaceCost),
    totalTransportCost: round2(totalTransportCost),
    totalMaterialsMarkup: round2(totalMaterialsMarkup),
    totalMechanismsCost: round2(totalMechanismsCost),
    totalQualityCost: round2(qualityControlCost),
    totalHours: round2(totalHours),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Aggregation across all materials in a job

import { calcMaterial, type MaterialInput, type MaterialCalcResult } from "./materials";

export interface MaterialRow extends MaterialInput {
  id: string;
  name: string;
  notes: string | null;
  sortOrder: number;
}

export interface MaterialSummary {
  totalWeight: number;
  totalSurfaceArea: number;
  totalWeldingHours: number;
  totalProcessingHours: number;
  totalGrindingHours: number;
  totalStrainingHours: number;
  totalRollingHours: number;
  totalDrillingHours: number;
  totalMaterialCost: number;     // non-auxiliary
  totalAuxiliaryCost: number;    // auxiliary items
  totalAllMaterialCost: number;  // both combined
  rows: Array<MaterialRow & { calc: MaterialCalcResult }>;
}

export function calcMaterialSummary(
  materials: MaterialRow[],
  jobQuantity: number,
  customDensities?: Record<string, number>
): MaterialSummary {
  let totalWeight = 0;
  let totalSurfaceArea = 0;
  let totalWeldingHours = 0;
  let totalProcessingHours = 0;
  let totalGrindingHours = 0;
  let totalStrainingHours = 0;
  let totalRollingHours = 0;
  let totalDrillingHours = 0;
  let totalMaterialCost = 0;
  let totalAuxiliaryCost = 0;

  const rows = materials.map((mat) => {
    const density = customDensities?.[mat.materialKey];
    const calc = calcMaterial(mat, jobQuantity, density);

    totalWeight += calc.totalKg;
    totalSurfaceArea += calc.surfaceM2;
    totalWeldingHours += calc.totalWeldingHours;
    totalProcessingHours += calc.totalProcessingHours;
    totalGrindingHours += calc.totalGrindingHours;
    totalStrainingHours += calc.totalStrainingHours;
    totalRollingHours += calc.totalRollingHours;
    totalDrillingHours += calc.totalDrillingHours;

    if (mat.partType === "auxiliary") {
      totalAuxiliaryCost += calc.materialCost;
    } else {
      totalMaterialCost += calc.materialCost;
    }

    return { ...mat, calc };
  });

  return {
    totalWeight,
    totalSurfaceArea,
    totalWeldingHours,
    totalProcessingHours,
    totalGrindingHours,
    totalStrainingHours,
    totalRollingHours,
    totalDrillingHours,
    totalMaterialCost,
    totalAuxiliaryCost,
    totalAllMaterialCost: totalMaterialCost + totalAuxiliaryCost,
    rows,
  };
}

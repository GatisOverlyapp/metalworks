// Unified material calculations - all formulas from Excel, dispatched by partType

export type PartType =
  | "flat"
  | "round_tube"
  | "rect_tube"
  | "shs"
  | "rhs"
  | "solid_round"
  | "angle"
  | "strip"
  | "auxiliary"
  | "wood"
  | "other";

export interface MaterialInput {
  partType: PartType;
  width: number | null;
  length: number | null;
  sideB: number | null;
  thickness: number | null;
  outerDiam: number | null;
  pcsPerUnit: number;
  materialKey: string;
  unit: string;
  pricePerUnit: number;
  wasteMarkup: number;
  weldingLength: number;
  weldingHours: number;
  grindingHours: number;
  strainingHours: number;
  rollingHours: number;
  drillingHours: number;
}

export interface MaterialCalcResult {
  totalPcs: number;
  areaM2: number;
  orderQty: number;
  kgPerUnit: number; // kgPerM2 or kgPerM depending on type
  totalKg: number;
  surfaceM2: number;
  materialCost: number;
  totalWeldingHours: number;
  totalGrindingHours: number;
  totalStrainingHours: number;
  totalRollingHours: number;
  totalDrillingHours: number;
  totalProcessingHours: number;
}

const DENSITIES: Record<string, number> = {
  steel: 7850,
  stainless: 7930,
  aluminium: 2710,
  copper: 8960,
  brass: 8500,
  wood: 600,
};

export function getDensity(materialKey: string, customDensities?: Record<string, number>): number {
  if (customDensities?.[materialKey] != null) return customDensities[materialKey];
  return DENSITIES[materialKey] ?? 7850;
}

function ceilTo(value: number, multiple: number): number {
  return Math.ceil(value / multiple) * multiple;
}

export function calcMaterial(input: MaterialInput, jobQuantity: number, density?: number): MaterialCalcResult {
  const d = density ?? getDensity(input.materialKey);
  const totalPcs = input.pcsPerUnit * jobQuantity;

  const w = input.width ?? 0;
  const l = input.length ?? 0;
  const b = input.sideB ?? 0;
  const t = input.thickness ?? 0;
  const od = input.outerDiam ?? 0;

  let areaM2 = 0;
  let orderQty = 0;
  let kgPerUnit = 0;
  let totalKg = 0;
  let surfaceM2 = 0;
  let materialCost = 0;

  switch (input.partType) {
    case "flat":
    case "strip": {
      areaM2 = (w * l * totalPcs) / 1_000_000;
      orderQty = areaM2 * (1 + input.wasteMarkup);
      kgPerUnit = (t * d) / 1000; // kg per m2
      totalKg = areaM2 * kgPerUnit;
      surfaceM2 = areaM2 * 2; // both sides
      materialCost = orderQty * input.pricePerUnit;
      break;
    }

    case "round_tube": {
      const lengthM = (l * totalPcs) / 1000;
      orderQty = ceilTo(lengthM, 6); // 6m stock lengths
      kgPerUnit = 0.0314 * (d / 100000) * t * (od - t) * 10; // kg per meter
      totalKg = lengthM * kgPerUnit;
      surfaceM2 = (od / 1000) * Math.PI * lengthM;
      materialCost = orderQty * input.pricePerUnit;
      areaM2 = surfaceM2; // for display
      break;
    }

    case "rect_tube":
    case "shs":
    case "rhs": {
      const sB = input.partType === "shs" ? w : b;
      const lengthM = (l * totalPcs) / 1000;
      orderQty = ceilTo(lengthM, 6);
      kgPerUnit = t * ((Math.PI / 100) * (w / 2 + sB / 2) - 0.044877 * t);
      totalKg = lengthM * kgPerUnit;
      surfaceM2 = (((w * 2) / 1000) + ((sB * 2) / 1000)) * lengthM;
      materialCost = orderQty * input.pricePerUnit;
      areaM2 = surfaceM2;
      break;
    }

    case "solid_round": {
      const lengthM = (l * totalPcs) / 1000;
      orderQty = ceilTo(lengthM, 6);
      kgPerUnit = t * t * 0.0061654; // t = diameter here
      totalKg = lengthM * kgPerUnit;
      surfaceM2 = (t / 1000) * Math.PI * lengthM;
      materialCost = orderQty * input.pricePerUnit;
      areaM2 = surfaceM2;
      break;
    }

    case "angle": {
      const lengthM = (l * totalPcs) / 1000;
      orderQty = ceilTo(lengthM, 6);
      kgPerUnit = (t * ((Math.PI / 100) * (w / 2 + b / 2) - 0.044877 * t) / 2) * 1.124;
      totalKg = lengthM * kgPerUnit;
      surfaceM2 = (((w + b) / 1000)) * lengthM;
      materialCost = orderQty * input.pricePerUnit;
      areaM2 = surfaceM2;
      break;
    }

    case "auxiliary":
    case "wood":
    case "other": {
      // Simple: quantity × price, no area/weight calc
      orderQty = input.pcsPerUnit * jobQuantity;
      materialCost = orderQty * input.pricePerUnit;
      break;
    }
  }

  // Work hours
  const totalWeldingHours = input.weldingHours > 0
    ? input.weldingHours * totalPcs
    : input.weldingLength * 0.8 * totalPcs;
  const totalGrindingHours = input.grindingHours * totalPcs;
  const totalStrainingHours = input.strainingHours * totalPcs;
  const totalRollingHours = input.rollingHours * totalPcs;
  const totalDrillingHours = input.drillingHours * totalPcs;
  const totalProcessingHours = totalGrindingHours + totalStrainingHours + totalRollingHours + totalDrillingHours;

  return {
    totalPcs,
    areaM2,
    orderQty,
    kgPerUnit,
    totalKg,
    surfaceM2,
    materialCost,
    totalWeldingHours,
    totalGrindingHours,
    totalStrainingHours,
    totalRollingHours,
    totalDrillingHours,
    totalProcessingHours,
  };
}

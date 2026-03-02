/**
 * Flat sheet metal calculation engine.
 * Fixes from original Excel:
 * - All rows included in sum ranges (was missing angle items)
 * - Consistent welding multiplier (0.8 h/m)
 * - Formulas present for every row
 */

export interface FlatSheetInput {
  quantity: number;
  width: number;      // mm
  length: number;     // mm
  thickness: number;  // mm
  density: number;    // kg/m3
  pricePerKg: number; // EUR/kg
  weldMeters: number; // meters of welding per piece
}

export interface FlatSheetCalc {
  pieceSurfaceM2: number;    // single piece surface area in m2
  totalSurfaceM2: number;    // all pieces surface area in m2
  kgPerM2: number;           // weight per m2
  pieceKg: number;           // weight per piece in kg
  totalKg: number;           // total weight in kg
  wasteKg: number;           // 10% waste
  totalKgWithWaste: number;  // total + waste
  totalCost: number;         // material cost EUR
  totalWeldMeters: number;   // total welding meters
  totalWeldHours: number;    // total welding hours (meters * 0.8)
}

export function calcFlatSheet(input: FlatSheetInput): FlatSheetCalc {
  const { quantity, width, length, thickness, density, pricePerKg, weldMeters } = input;

  // Surface area per piece: (width_mm * length_mm) / 1,000,000 = m2
  const pieceSurfaceM2 = (width * length) / 1_000_000;
  const totalSurfaceM2 = pieceSurfaceM2 * quantity;

  // kg/m2 = (thickness_mm * density_kg/m3) / 1000
  const kgPerM2 = (thickness * density) / 1000;

  // Weight
  const pieceKg = pieceSurfaceM2 * kgPerM2;
  const totalKg = pieceKg * quantity;
  const wasteKg = totalKg * 0.10; // 10% waste
  const totalKgWithWaste = totalKg + wasteKg;

  // Cost
  const totalCost = totalKgWithWaste * pricePerKg;

  // Welding: meters * 0.8 h/m (consistent multiplier - was inconsistent in Excel)
  const totalWeldMeters = weldMeters * quantity;
  const totalWeldHours = totalWeldMeters * 0.8;

  return {
    pieceSurfaceM2: round2(pieceSurfaceM2),
    totalSurfaceM2: round2(totalSurfaceM2),
    kgPerM2: round2(kgPerM2),
    pieceKg: round2(pieceKg),
    totalKg: round2(totalKg),
    wasteKg: round2(wasteKg),
    totalKgWithWaste: round2(totalKgWithWaste),
    totalCost: round2(totalCost),
    totalWeldMeters: round2(totalWeldMeters),
    totalWeldHours: round2(totalWeldHours),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Tube/profile calculation engine.
 * Supports 6 profile types with different kg/m formulas.
 * Fixes from original Excel:
 * - All profile types included in material sum ranges
 * - Row 53 formulas restored
 * - Order lengths: CEILING(totalM, 6) for 6m stock
 */

export type ProfileType = "shs" | "rhs" | "round_tube" | "solid_round" | "angle" | "channel";

export interface TubeProfileInput {
  profileType: ProfileType;
  quantity: number;
  lengthMm: number;   // length per piece in mm
  dimA: number;        // width or diameter (mm)
  dimB: number;        // height (mm), 0 for round/solid
  thickness: number;   // wall thickness (mm)
  density: number;     // kg/m3
  pricePerKg: number;  // EUR/kg
  weldMeters: number;  // meters of welding per piece
}

export interface TubeProfileCalc {
  kgPerM: number;           // weight per running meter
  pieceLengthM: number;     // single piece length in meters
  totalLengthM: number;     // all pieces total length in meters
  orderLengthM: number;     // rounded up to 6m stock lengths
  pieceKg: number;          // weight per piece
  totalKg: number;          // total weight
  totalCost: number;        // material cost EUR
  totalWeldMeters: number;  // total welding meters
  totalWeldHours: number;   // total welding hours
}

/**
 * Calculate kg/m based on profile type.
 * Formulas from original Excel, verified against steel tables.
 */
export function calcKgPerM(
  type: ProfileType,
  dimA: number,
  dimB: number,
  thickness: number,
  density: number
): number {
  switch (type) {
    case "shs":
    case "rhs":
    case "channel":
      // Profilcaurule/SHS/RHS: t * ((π/100) * ((A/2)+(B/2)) - 0.044877*t)
      // For SHS: A=B, for RHS: A≠B
      return thickness * ((Math.PI / 100) * ((dimA / 2) + ((dimB || dimA) / 2)) - 0.044877 * thickness);

    case "round_tube":
      // Round tube: 0.0314 * (density/100000) * t * (D-t) * 10
      // Simplified: density factor converts to proper kg/m
      return 0.0314 * (density / 100000) * thickness * (dimA - thickness) * 10;

    case "solid_round":
      // Solid round bar: d² * 0.0061654 (for steel 7850 kg/m3)
      // Adjusted for different densities: d² * 0.0061654 * (density / 7850)
      return dimA * dimA * 0.0061654 * (density / 7850);

    case "angle":
      // Angle (L-profile): derived from equivalent SHS formula / 2 * 1.124
      // This accounts for the L-shape cross section
      {
        const equiv = thickness * ((Math.PI / 100) * ((dimA / 2) + ((dimB || dimA) / 2)) - 0.044877 * thickness);
        return (equiv / 2) * 1.124;
      }

    default:
      return 0;
  }
}

export function calcTubeProfile(input: TubeProfileInput): TubeProfileCalc {
  const { profileType, quantity, lengthMm, dimA, dimB, thickness, density, pricePerKg, weldMeters } = input;

  const kgPerM = calcKgPerM(profileType, dimA, dimB, thickness, density);
  const pieceLengthM = lengthMm / 1000;
  const totalLengthM = pieceLengthM * quantity;

  // Order length: round up to nearest 6m (standard stock length)
  const orderLengthM = totalLengthM > 0 ? Math.ceil(totalLengthM / 6) * 6 : 0;

  const pieceKg = kgPerM * pieceLengthM;
  const totalKg = kgPerM * orderLengthM; // cost based on order length (includes offcuts)

  const totalCost = totalKg * pricePerKg;

  const totalWeldMeters = weldMeters * quantity;
  const totalWeldHours = totalWeldMeters * 0.8;

  return {
    kgPerM: round2(kgPerM),
    pieceLengthM: round2(pieceLengthM),
    totalLengthM: round2(totalLengthM),
    orderLengthM: round2(orderLengthM),
    pieceKg: round2(pieceKg),
    totalKg: round2(totalKg),
    totalCost: round2(totalCost),
    totalWeldMeters: round2(totalWeldMeters),
    totalWeldHours: round2(totalWeldHours),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Client-side estimate state types */

export interface FlatSheetPartState {
  id: string;
  sortOrder: number;
  name: string;
  quantity: number;
  width: number;
  length: number;
  thickness: number;
  material: string;
  density: number;
  pricePerKg: number;
  weldMeters: number;
  // Calculated
  surfaceArea: number;
  totalKg: number;
  totalCost: number;
}

export interface TubeProfilePartState {
  id: string;
  sortOrder: number;
  name: string;
  profileType: string;
  quantity: number;
  lengthMm: number;
  dimA: number;
  dimB: number;
  thickness: number;
  material: string;
  density: number;
  pricePerKg: number;
  weldMeters: number;
  // Calculated
  totalLengthM: number;
  orderLengthM: number;
  kgPerM: number;
  totalKg: number;
  totalCost: number;
}

export interface AuxiliaryItemState {
  id: string;
  sortOrder: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  notes: string;
}

export interface ProductionLineState {
  id: string;
  sortOrder: number;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  isAutoLinked: boolean;
}

export interface DeliveryLineState {
  id: string;
  sortOrder: number;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface ProposalLineState {
  id: string;
  sortOrder: number;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface EstimateState {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddr: string;
  companyName: string;
  companyReg: string;
  companyAddr: string;
  companyPhone: string;
  companyEmail: string;
  companyBank: string;
  status: string;
  discount: number;
  vatRate: number;
  notes: string;
  flatSheetParts: FlatSheetPartState[];
  tubeProfileParts: TubeProfilePartState[];
  auxiliaryItems: AuxiliaryItemState[];
  productionLines: ProductionLineState[];
  deliveryLines: DeliveryLineState[];
  proposalLines: ProposalLineState[];
  // Totals
  totalMaterialsCost: number;
  totalProductionCost: number;
  totalDeliveryCost: number;
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalBeforeVat: number;
  totalVat: number;
  totalWithVat: number;
}

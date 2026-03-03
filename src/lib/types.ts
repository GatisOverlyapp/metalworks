// Shared types used across API and client

export interface EstimateListItem {
  id: string;
  projectName: string;
  clientName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobCount: number;
}

export interface FullEstimate {
  id: string;
  projectName: string;
  clientName: string | null;
  clientCompany: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  companyName: string | null;
  companyRegNr: string | null;
  offerValidDays: number;
  advancePercent: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobs: FullJob[];
}

export interface FullJob {
  id: string;
  estimateId: string;
  name: string;
  description: string | null;
  quantity: number;
  sortOrder: number;
  jobType: string;
  productionDiscount: number;
  deliveryDiscount: number;
  materials: MaterialItemData[];
  costLines: CostLineData[];
}

export interface MaterialItemData {
  id: string;
  jobId: string;
  sortOrder: number;
  name: string;
  notes: string | null;
  partType: string;
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

export interface CostLineData {
  id: string;
  jobId: string;
  sortOrder: number;
  section: string;
  category: string;
  lineKey: string;
  label: string;
  quantity: number;
  rate: number;
  unit: string;
  autoLinked: boolean;
  isCorrection: boolean;
}

// Default cost line templates for creating new jobs
export const DEFAULT_PRODUCTION_LINES: Omit<CostLineData, "id" | "jobId">[] = [
  { sortOrder: 0, section: "production", category: "welding", lineKey: "weld_workshop", label: "Metināt darbnīca", quantity: 0, rate: 25, unit: "st", autoLinked: true, isCorrection: false },
  { sortOrder: 1, section: "production", category: "metalwork", lineKey: "metal_workshop", label: "Metālapstrāde darbnīca", quantity: 0, rate: 23, unit: "st", autoLinked: true, isCorrection: false },
  { sortOrder: 2, section: "production", category: "assembly", lineKey: "assembly_helper", label: "Demontāža/montāža (palīgstrādnieks)", quantity: 0, rate: 20, unit: "st", autoLinked: false, isCorrection: false },
  { sortOrder: 3, section: "production", category: "design", lineKey: "design_measure", label: "Objekta uzmērīšana_rasēt", quantity: 0, rate: 30, unit: "st", autoLinked: false, isCorrection: false },
  { sortOrder: 4, section: "production", category: "design", lineKey: "design_office", label: "Birojs", quantity: 0, rate: 25, unit: "st", autoLinked: false, isCorrection: false },
  { sortOrder: 5, section: "production", category: "qc", lineKey: "qc_production", label: "KONTROLE ražošanai 5%", quantity: 0, rate: 19, unit: "st", autoLinked: true, isCorrection: false },
  { sortOrder: 6, section: "production", category: "sandblasting", lineKey: "sandblast_m2", label: "Smilšustrūkla, m2", quantity: 0, rate: 7.5, unit: "m2", autoLinked: true, isCorrection: false },
  { sortOrder: 7, section: "production", category: "coating", lineKey: "coat_primer", label: "Pulverkrāsošana grunts 1 kārta", quantity: 0, rate: 8.5, unit: "m2", autoLinked: true, isCorrection: false },
  { sortOrder: 8, section: "production", category: "coating", lineKey: "coat_topcoat", label: "Pulverkrāsošana 1 kārta", quantity: 0, rate: 9.5, unit: "m2", autoLinked: true, isCorrection: false },
  { sortOrder: 9, section: "production", category: "transport", lineKey: "transport_car", label: "Vieglais, km", quantity: 0, rate: 0.65, unit: "km", autoLinked: false, isCorrection: false },
  { sortOrder: 10, section: "production", category: "materials", lineKey: "mat_main", label: "MATERIĀLI", quantity: 0, rate: 1.3, unit: "kompl", autoLinked: true, isCorrection: false },
  { sortOrder: 11, section: "production", category: "materials", lineKey: "mat_auxiliary", label: "PALĪGMATERIĀLI", quantity: 0, rate: 1.3, unit: "kompl", autoLinked: true, isCorrection: false },
];

export const DEFAULT_DELIVERY_LINES: Omit<CostLineData, "id" | "jobId">[] = [
  { sortOrder: 0, section: "delivery", category: "assembly", lineKey: "assembly_helper", label: "Demontāža/montāža (palīgstrādnieks)", quantity: 0, rate: 20, unit: "st", autoLinked: false, isCorrection: false },
  { sortOrder: 1, section: "delivery", category: "transport", lineKey: "transport_truck_km", label: "Mersis, km", quantity: 0, rate: 1.2, unit: "km", autoLinked: false, isCorrection: false },
  { sortOrder: 2, section: "delivery", category: "transport", lineKey: "transport_truck_hr", label: "Mersis, st", quantity: 0, rate: 30, unit: "st", autoLinked: false, isCorrection: false },
];

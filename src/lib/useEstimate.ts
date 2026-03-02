"use client";

import { useReducer, useCallback, useEffect, useRef, useMemo } from "react";
import type { EstimateState, FlatSheetPartState, TubeProfilePartState, AuxiliaryItemState, ProductionLineState, DeliveryLineState, ProposalLineState } from "./types";
import { calcFlatSheet } from "./calc/flat-sheet";
import { calcTubeProfile, type ProfileType } from "./calc/tube-profile";
import { calcProductionLine, calcQualityControl, calcProductionTotals } from "./calc/production";
import { calcDeliveryLine, calcDeliveryTotals } from "./calc/delivery";
import { calcEstimateSummary } from "./calc/summary";

type Action =
  | { type: "SET_STATE"; state: EstimateState }
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "SET_FLAT_SHEET"; index: number; field: string; value: unknown }
  | { type: "ADD_FLAT_SHEET" }
  | { type: "DEL_FLAT_SHEET"; id: string }
  | { type: "SET_TUBE_PROFILE"; index: number; field: string; value: unknown }
  | { type: "ADD_TUBE_PROFILE" }
  | { type: "DEL_TUBE_PROFILE"; id: string }
  | { type: "SET_AUX_ITEM"; index: number; field: string; value: unknown }
  | { type: "ADD_AUX_ITEM" }
  | { type: "DEL_AUX_ITEM"; id: string }
  | { type: "SET_PROD_LINE"; index: number; field: string; value: unknown }
  | { type: "ADD_PROD_LINE" }
  | { type: "DEL_PROD_LINE"; id: string }
  | { type: "SET_DEL_LINE"; index: number; field: string; value: unknown }
  | { type: "ADD_DEL_LINE" }
  | { type: "DEL_DEL_LINE"; id: string }
  | { type: "SET_PROP_LINE"; index: number; field: string; value: unknown }
  | { type: "ADD_PROP_LINE" }
  | { type: "DEL_PROP_LINE"; id: string };

let nextTempId = 1;
function tempId() {
  return `temp_${nextTempId++}`;
}

function emptyFlatSheet(): FlatSheetPartState {
  return {
    id: tempId(), sortOrder: 0, name: "", quantity: 1,
    width: 0, length: 0, thickness: 0, material: "S235", density: 7850,
    pricePerKg: 0, weldMeters: 0, surfaceArea: 0, totalKg: 0, totalCost: 0,
  };
}

function emptyTubeProfile(): TubeProfilePartState {
  return {
    id: tempId(), sortOrder: 0, name: "", profileType: "shs",
    quantity: 1, lengthMm: 0, dimA: 0, dimB: 0, thickness: 0,
    material: "S235", density: 7850, pricePerKg: 0, weldMeters: 0,
    totalLengthM: 0, orderLengthM: 0, kgPerM: 0, totalKg: 0, totalCost: 0,
  };
}

function emptyAuxItem(): AuxiliaryItemState {
  return { id: tempId(), sortOrder: 0, name: "", quantity: 1, unit: "gab.", unitPrice: 0, totalCost: 0, notes: "" };
}

function emptyProdLine(): ProductionLineState {
  return { id: tempId(), sortOrder: 0, category: "welding", name: "", unit: "h", quantity: 0, unitPrice: 0, totalCost: 0, isAutoLinked: false };
}

function emptyDelLine(): DeliveryLineState {
  return { id: tempId(), sortOrder: 0, category: "installation", name: "", unit: "h", quantity: 0, unitPrice: 0, totalCost: 0 };
}

function emptyPropLine(): ProposalLineState {
  return { id: tempId(), sortOrder: 0, name: "", unit: "kompl.", quantity: 1, unitPrice: 0, totalCost: 0 };
}

function recalcFlatSheet(part: FlatSheetPartState): FlatSheetPartState {
  const calc = calcFlatSheet({
    quantity: part.quantity,
    width: part.width,
    length: part.length,
    thickness: part.thickness,
    density: part.density,
    pricePerKg: part.pricePerKg,
    weldMeters: part.weldMeters,
  });
  return { ...part, surfaceArea: calc.totalSurfaceM2, totalKg: calc.totalKgWithWaste, totalCost: calc.totalCost };
}

function recalcTubeProfile(part: TubeProfilePartState): TubeProfilePartState {
  const calc = calcTubeProfile({
    profileType: part.profileType as ProfileType,
    quantity: part.quantity,
    lengthMm: part.lengthMm,
    dimA: part.dimA,
    dimB: part.dimB,
    thickness: part.thickness,
    density: part.density,
    pricePerKg: part.pricePerKg,
    weldMeters: part.weldMeters,
  });
  return {
    ...part,
    totalLengthM: calc.totalLengthM,
    orderLengthM: calc.orderLengthM,
    kgPerM: calc.kgPerM,
    totalKg: calc.totalKg,
    totalCost: calc.totalCost,
  };
}

function recalcAuxItem(item: AuxiliaryItemState): AuxiliaryItemState {
  return { ...item, totalCost: Math.round(item.quantity * item.unitPrice * 100) / 100 };
}

function recalcProdLine(line: ProductionLineState): ProductionLineState {
  return { ...line, totalCost: calcProductionLine({ category: line.category, quantity: line.quantity, unitPrice: line.unitPrice }) };
}

function recalcDelLine(line: DeliveryLineState): DeliveryLineState {
  return { ...line, totalCost: calcDeliveryLine({ category: line.category, quantity: line.quantity, unitPrice: line.unitPrice }) };
}

function recalcPropLine(line: ProposalLineState): ProposalLineState {
  return { ...line, totalCost: Math.round(line.quantity * line.unitPrice * 100) / 100 };
}

function recalcTotals(state: EstimateState): EstimateState {
  const totalMaterialsCost =
    state.flatSheetParts.reduce((s, p) => s + p.totalCost, 0) +
    state.tubeProfileParts.reduce((s, p) => s + p.totalCost, 0) +
    state.auxiliaryItems.reduce((s, p) => s + p.totalCost, 0);

  // Production with quality control
  const weldHours = state.productionLines.filter(l => l.category === "welding").reduce((s, l) => s + l.quantity, 0);
  const metalworkHours = state.productionLines.filter(l => l.category === "metalwork").reduce((s, l) => s + l.quantity, 0);
  const surfaceHours = state.productionLines.filter(l => l.category === "surface").reduce((s, l) => s + l.quantity, 0);
  const avgRate = state.productionLines.length > 0
    ? state.productionLines.filter(l => ["welding", "metalwork", "surface"].includes(l.category) && l.quantity > 0)
        .reduce((s, l) => s + l.unitPrice, 0) /
      Math.max(state.productionLines.filter(l => ["welding", "metalwork", "surface"].includes(l.category) && l.quantity > 0).length, 1)
    : 15;
  const qualityCost = calcQualityControl(weldHours, metalworkHours, surfaceHours, avgRate);

  const prodTotals = calcProductionTotals({
    lines: state.productionLines.map(l => ({
      category: l.category,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      totalCost: l.totalCost,
    })),
    qualityControlCost: qualityCost,
  });

  const delTotals = calcDeliveryTotals(
    state.deliveryLines.map(l => ({
      category: l.category,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      totalCost: l.totalCost,
    }))
  );

  const summary = calcEstimateSummary({
    totalMaterialsCost,
    totalProductionCost: prodTotals.totalProductionCost,
    totalDeliveryCost: delTotals.totalDeliveryCost,
    discount: state.discount,
    vatRate: state.vatRate,
  });

  return {
    ...state,
    totalMaterialsCost: Math.round(totalMaterialsCost * 100) / 100,
    totalProductionCost: prodTotals.totalProductionCost,
    totalDeliveryCost: delTotals.totalDeliveryCost,
    totalBeforeDiscount: summary.totalBeforeDiscount,
    totalDiscount: summary.discountAmount,
    totalBeforeVat: summary.totalBeforeVat,
    totalVat: summary.vatAmount,
    totalWithVat: summary.totalWithVat,
  };
}

function updateArrayItem<T>(arr: T[], index: number, field: string, value: unknown): T[] {
  return arr.map((item, i) => (i === index ? { ...item, [field]: value } : item));
}

function reducer(state: EstimateState, action: Action): EstimateState {
  let next: EstimateState;
  switch (action.type) {
    case "SET_STATE":
      return recalcTotals(action.state);

    case "SET_FIELD":
      next = { ...state, [action.field]: action.value };
      return recalcTotals(next);

    case "SET_FLAT_SHEET": {
      const parts = updateArrayItem(state.flatSheetParts, action.index, action.field, action.value);
      parts[action.index] = recalcFlatSheet(parts[action.index]);
      next = { ...state, flatSheetParts: parts };
      return recalcTotals(next);
    }
    case "ADD_FLAT_SHEET":
      return { ...state, flatSheetParts: [...state.flatSheetParts, emptyFlatSheet()] };
    case "DEL_FLAT_SHEET":
      next = { ...state, flatSheetParts: state.flatSheetParts.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    case "SET_TUBE_PROFILE": {
      const parts = updateArrayItem(state.tubeProfileParts, action.index, action.field, action.value);
      parts[action.index] = recalcTubeProfile(parts[action.index]);
      next = { ...state, tubeProfileParts: parts };
      return recalcTotals(next);
    }
    case "ADD_TUBE_PROFILE":
      return { ...state, tubeProfileParts: [...state.tubeProfileParts, emptyTubeProfile()] };
    case "DEL_TUBE_PROFILE":
      next = { ...state, tubeProfileParts: state.tubeProfileParts.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    case "SET_AUX_ITEM": {
      const items = updateArrayItem(state.auxiliaryItems, action.index, action.field, action.value);
      items[action.index] = recalcAuxItem(items[action.index]);
      next = { ...state, auxiliaryItems: items };
      return recalcTotals(next);
    }
    case "ADD_AUX_ITEM":
      return { ...state, auxiliaryItems: [...state.auxiliaryItems, emptyAuxItem()] };
    case "DEL_AUX_ITEM":
      next = { ...state, auxiliaryItems: state.auxiliaryItems.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    case "SET_PROD_LINE": {
      const lines = updateArrayItem(state.productionLines, action.index, action.field, action.value);
      lines[action.index] = recalcProdLine(lines[action.index]);
      next = { ...state, productionLines: lines };
      return recalcTotals(next);
    }
    case "ADD_PROD_LINE":
      return { ...state, productionLines: [...state.productionLines, emptyProdLine()] };
    case "DEL_PROD_LINE":
      next = { ...state, productionLines: state.productionLines.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    case "SET_DEL_LINE": {
      const lines = updateArrayItem(state.deliveryLines, action.index, action.field, action.value);
      lines[action.index] = recalcDelLine(lines[action.index]);
      next = { ...state, deliveryLines: lines };
      return recalcTotals(next);
    }
    case "ADD_DEL_LINE":
      return { ...state, deliveryLines: [...state.deliveryLines, emptyDelLine()] };
    case "DEL_DEL_LINE":
      next = { ...state, deliveryLines: state.deliveryLines.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    case "SET_PROP_LINE": {
      const lines = updateArrayItem(state.proposalLines, action.index, action.field, action.value);
      lines[action.index] = recalcPropLine(lines[action.index]);
      next = { ...state, proposalLines: lines };
      return recalcTotals(next);
    }
    case "ADD_PROP_LINE":
      return { ...state, proposalLines: [...state.proposalLines, emptyPropLine()] };
    case "DEL_PROP_LINE":
      next = { ...state, proposalLines: state.proposalLines.filter(p => p.id !== action.id) };
      return recalcTotals(next);

    default:
      return state;
  }
}

const emptyState: EstimateState = {
  id: "",
  projectName: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientAddr: "",
  companyName: "",
  companyReg: "",
  companyAddr: "",
  companyPhone: "",
  companyEmail: "",
  companyBank: "",
  status: "draft",
  discount: 0,
  vatRate: 21,
  notes: "",
  flatSheetParts: [],
  tubeProfileParts: [],
  auxiliaryItems: [],
  productionLines: [],
  deliveryLines: [],
  proposalLines: [],
  totalMaterialsCost: 0,
  totalProductionCost: 0,
  totalDeliveryCost: 0,
  totalBeforeDiscount: 0,
  totalDiscount: 0,
  totalBeforeVat: 0,
  totalVat: 0,
  totalWithVat: 0,
};

export function useEstimate(estimateId: string) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  // Load estimate data
  useEffect(() => {
    if (!estimateId) return;
    fetch(`/api/estimates/${estimateId}`)
      .then((r) => r.json())
      .then((data) => {
        // Recalculate all derived fields on load
        const loaded: EstimateState = {
          ...emptyState,
          ...data,
          flatSheetParts: (data.flatSheetParts || []).map(recalcFlatSheet),
          tubeProfileParts: (data.tubeProfileParts || []).map(recalcTubeProfile),
          auxiliaryItems: (data.auxiliaryItems || []).map(recalcAuxItem),
          productionLines: (data.productionLines || []).map(recalcProdLine),
          deliveryLines: (data.deliveryLines || []).map(recalcDelLine),
          proposalLines: (data.proposalLines || []).map(recalcPropLine),
        };
        dispatch({ type: "SET_STATE", state: loaded });
        loadedRef.current = true;
      });
  }, [estimateId]);

  // Auto-save with 500ms debounce
  const save = useCallback(() => {
    if (!loadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/estimates/${estimateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
    }, 500);
  }, [estimateId, state]);

  useEffect(() => {
    if (loadedRef.current) save();
  }, [save]);

  // Derived calculations
  const materialsSummary = useMemo(() => {
    const totalFlatKg = state.flatSheetParts.reduce((s, p) => s + p.totalKg, 0);
    const totalTubeKg = state.tubeProfileParts.reduce((s, p) => s + p.totalKg, 0);
    const totalSurfaceM2 = state.flatSheetParts.reduce((s, p) => s + p.surfaceArea, 0);
    const totalWeldMeters =
      state.flatSheetParts.reduce((s, p) => s + p.weldMeters * p.quantity, 0) +
      state.tubeProfileParts.reduce((s, p) => s + p.weldMeters * p.quantity, 0);
    const totalWeldHours = totalWeldMeters * 0.8;

    return {
      totalKg: Math.round((totalFlatKg + totalTubeKg) * 100) / 100,
      totalFlatKg: Math.round(totalFlatKg * 100) / 100,
      totalTubeKg: Math.round(totalTubeKg * 100) / 100,
      totalSurfaceM2: Math.round(totalSurfaceM2 * 100) / 100,
      totalWeldMeters: Math.round(totalWeldMeters * 100) / 100,
      totalWeldHours: Math.round(totalWeldHours * 100) / 100,
      totalMaterialsCost: state.totalMaterialsCost,
    };
  }, [state.flatSheetParts, state.tubeProfileParts, state.totalMaterialsCost]);

  return { state, dispatch, materialsSummary };
}

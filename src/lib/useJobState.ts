"use client";

import { useReducer, useMemo, useCallback, useRef, useEffect } from "react";
import type { FullJob, MaterialItemData, CostLineData } from "./types";
import { calcMaterialSummary, type MaterialRow } from "./calc/summary";
import { calcProduction, calcDelivery } from "./calc/production";
import type { PartType } from "./calc/materials";

// Actions
type Action =
  | { type: "SET_JOB_META"; field: string; value: unknown }
  | { type: "SET_MATERIAL_FIELD"; id: string; field: string; value: unknown }
  | { type: "ADD_MATERIAL_ROW"; partType?: string }
  | { type: "DELETE_MATERIAL_ROW"; id: string }
  | { type: "SET_COST_LINE_FIELD"; id: string; field: string; value: unknown }
  | { type: "ADD_COST_LINE"; section: string; category: string; lineKey: string; label: string; rate: number; unit: string }
  | { type: "DELETE_COST_LINE"; id: string }
  | { type: "LOAD_JOB"; job: FullJob };

function tempId(): string {
  return "tmp_" + Math.random().toString(36).slice(2, 11);
}

function emptyMaterial(partType: string, sortOrder: number): MaterialItemData {
  return {
    id: tempId(),
    jobId: "",
    sortOrder,
    name: "",
    notes: null,
    partType,
    width: null,
    length: null,
    sideB: null,
    thickness: null,
    outerDiam: null,
    pcsPerUnit: 1,
    materialKey: "steel",
    unit: "m2",
    pricePerUnit: 0,
    wasteMarkup: 0.10,
    weldingLength: 0,
    weldingHours: 0,
    grindingHours: 0,
    strainingHours: 0,
    rollingHours: 0,
    drillingHours: 0,
  };
}

function reducer(state: FullJob, action: Action): FullJob {
  switch (action.type) {
    case "LOAD_JOB":
      return action.job;

    case "SET_JOB_META":
      return { ...state, [action.field]: action.value };

    case "SET_MATERIAL_FIELD":
      return {
        ...state,
        materials: state.materials.map((m) =>
          m.id === action.id ? { ...m, [action.field]: action.value } : m
        ),
      };

    case "ADD_MATERIAL_ROW": {
      const maxOrder = state.materials.reduce((max, m) => Math.max(max, m.sortOrder), -1);
      return {
        ...state,
        materials: [...state.materials, emptyMaterial(action.partType ?? "flat", maxOrder + 1)],
      };
    }

    case "DELETE_MATERIAL_ROW":
      return {
        ...state,
        materials: state.materials.filter((m) => m.id !== action.id),
      };

    case "SET_COST_LINE_FIELD":
      return {
        ...state,
        costLines: state.costLines.map((l) =>
          l.id === action.id ? { ...l, [action.field]: action.value } : l
        ),
      };

    case "ADD_COST_LINE": {
      const maxOrder = state.costLines
        .filter((l) => l.section === action.section)
        .reduce((max, l) => Math.max(max, l.sortOrder), -1);
      const newLine: CostLineData = {
        id: tempId(),
        jobId: state.id,
        sortOrder: maxOrder + 1,
        section: action.section,
        category: action.category,
        lineKey: action.lineKey,
        label: action.label,
        quantity: 0,
        rate: action.rate,
        unit: action.unit,
        autoLinked: false,
        isCorrection: false,
      };
      return { ...state, costLines: [...state.costLines, newLine] };
    }

    case "DELETE_COST_LINE":
      return {
        ...state,
        costLines: state.costLines.filter((l) => l.id !== action.id),
      };

    default:
      return state;
  }
}

export function useJobState(initialJob: FullJob) {
  const [job, dispatch] = useReducer(reducer, initialJob);

  // Convert MaterialItemData to MaterialRow for calc
  const materialRows: MaterialRow[] = useMemo(
    () =>
      job.materials.map((m) => ({
        ...m,
        partType: m.partType as PartType,
      })),
    [job.materials]
  );

  const materialSummary = useMemo(
    () => calcMaterialSummary(materialRows, job.quantity),
    [materialRows, job.quantity]
  );

  const productionResult = useMemo(
    () => calcProduction(job.costLines, materialSummary, job.productionDiscount, job.quantity),
    [job.costLines, materialSummary, job.productionDiscount, job.quantity]
  );

  const deliveryResult = useMemo(
    () => calcDelivery(job.costLines, materialSummary, job.deliveryDiscount),
    [job.costLines, materialSummary, job.deliveryDiscount]
  );

  // Debounced auto-save
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const saveJob = useCallback(
    (jobData: FullJob) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (!isMounted.current) return;
        try {
          await fetch(`/api/estimates/${jobData.estimateId}/jobs/${jobData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: jobData.name,
              description: jobData.description,
              quantity: jobData.quantity,
              sortOrder: jobData.sortOrder,
              jobType: jobData.jobType,
              productionDiscount: jobData.productionDiscount,
              deliveryDiscount: jobData.deliveryDiscount,
              materials: jobData.materials,
              costLines: jobData.costLines,
            }),
          });
        } catch (e) {
          console.error("Auto-save failed:", e);
        }
      }, 500);
    },
    []
  );

  // Trigger save on every state change (except initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveJob(job);
  }, [job, saveJob]);

  return {
    job,
    dispatch,
    materialSummary,
    productionResult,
    deliveryResult,
  };
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useJobState } from "@/lib/useJobState";
import type { FullJob } from "@/lib/types";
import type { MaterialSummary } from "@/lib/calc/summary";
import type { ProductionResult, DeliveryResult } from "@/lib/calc/production";

type Dispatch = ReturnType<typeof useJobState>["dispatch"];

interface JobContextValue {
  job: FullJob;
  dispatch: Dispatch;
  materialSummary: MaterialSummary;
  productionResult: ProductionResult;
  deliveryResult: DeliveryResult;
}

const JobContext = createContext<JobContextValue | null>(null);

export function JobProvider({ initialJob, children }: { initialJob: FullJob; children: ReactNode }) {
  const state = useJobState(initialJob);
  return <JobContext.Provider value={state}>{children}</JobContext.Provider>;
}

export function useJob(): JobContextValue {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error("useJob must be used within JobProvider");
  return ctx;
}

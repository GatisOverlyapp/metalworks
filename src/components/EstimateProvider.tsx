"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEstimate } from "@/lib/useEstimate";

type EstimateContextType = ReturnType<typeof useEstimate>;

const EstimateContext = createContext<EstimateContextType | null>(null);

export function EstimateProvider({ estimateId, children }: { estimateId: string; children: ReactNode }) {
  const estimate = useEstimate(estimateId);
  return (
    <EstimateContext.Provider value={estimate}>
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimateContext() {
  const ctx = useContext(EstimateContext);
  if (!ctx) throw new Error("useEstimateContext must be used within EstimateProvider");
  return ctx;
}

"use client";

import { fmt, fmtEur } from "@/lib/format";
import type { MaterialSummary } from "@/lib/calc/summary";

interface SummaryBarProps {
  summary: MaterialSummary;
}

export function SummaryBar({ summary }: SummaryBarProps) {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-border grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
      <div>
        <span className="text-muted block">Kopā svars</span>
        <span className="font-bold text-sm">{fmt(summary.totalWeight, 1)} kg</span>
      </div>
      <div>
        <span className="text-muted block">Kopā virsma</span>
        <span className="font-bold text-sm">{fmt(summary.totalSurfaceArea, 2)} m²</span>
      </div>
      <div>
        <span className="text-muted block">Metināšana</span>
        <span className="font-bold text-sm">{fmt(summary.totalWeldingHours, 1)} st</span>
      </div>
      <div>
        <span className="text-muted block">Apstrāde</span>
        <span className="font-bold text-sm">{fmt(summary.totalProcessingHours, 1)} st</span>
      </div>
      <div>
        <span className="text-muted block">Materiāli</span>
        <span className="font-bold text-sm">{fmtEur(summary.totalMaterialCost)}</span>
      </div>
      <div>
        <span className="text-muted block">Palīgmat.</span>
        <span className="font-bold text-sm">{fmtEur(summary.totalAuxiliaryCost)}</span>
      </div>
      <div>
        <span className="text-muted block">Kopā mat.</span>
        <span className="font-bold text-sm text-primary">{fmtEur(summary.totalAllMaterialCost)}</span>
      </div>
    </div>
  );
}

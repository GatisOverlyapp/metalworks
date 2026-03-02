"use client";

import { useEstimateContext } from "@/components/EstimateProvider";
import { EditableTable, type Column } from "@/components/EditableTable";
import { SummaryCard } from "@/components/SummaryCard";
import { formatEUR, formatNum } from "@/lib/format";
import type { ProductionLineState } from "@/lib/types";
import { calcQualityControl } from "@/lib/calc/production";

const categoryOptions = [
  { value: "welding", label: "Metināšana" },
  { value: "metalwork", label: "Atslēdznieku darbi" },
  { value: "surface", label: "Virsmu apstrāde" },
  { value: "transport", label: "Transports" },
  { value: "materials", label: "Materiālu uzcenojums" },
  { value: "mechanisms", label: "Mehānismi" },
];

const unitOptions = [
  { value: "h", label: "h" },
  { value: "km", label: "km" },
  { value: "kompl.", label: "kompl." },
  { value: "%", label: "%" },
];

const fmtEur = (v: number) => formatEUR(v);

const prodCols: Column<ProductionLineState>[] = [
  { key: "category", header: "Kategorija", type: "select", width: "150px", options: categoryOptions },
  { key: "name", header: "Nosaukums", type: "text", width: "200px" },
  { key: "unit", header: "Mērv.", type: "select", width: "75px", options: unitOptions },
  { key: "quantity", header: "Daudzums", type: "number", width: "90px" },
  { key: "unitPrice", header: "Cena EUR", type: "number", width: "90px" },
  { key: "totalCost", header: "Summa EUR", type: "number", width: "110px", readOnly: true, formatValue: fmtEur },
];

export default function ProductionPage() {
  const { state, dispatch, materialsSummary } = useEstimateContext();

  // Calculate quality control for display
  const weldHours = state.productionLines.filter(l => l.category === "welding").reduce((s, l) => s + l.quantity, 0);
  const metalworkHours = state.productionLines.filter(l => l.category === "metalwork").reduce((s, l) => s + l.quantity, 0);
  const surfaceHours = state.productionLines.filter(l => l.category === "surface").reduce((s, l) => s + l.quantity, 0);
  const hourlyLines = state.productionLines.filter(l => ["welding", "metalwork", "surface"].includes(l.category) && l.quantity > 0);
  const avgRate = hourlyLines.length > 0
    ? hourlyLines.reduce((s, l) => s + l.unitPrice, 0) / hourlyLines.length
    : 15;
  const qualityCost = calcQualityControl(weldHours, metalworkHours, surfaceHours, avgRate);
  const totalProdHours = weldHours + metalworkHours + surfaceHours;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Ražošanas stundas" value={`${formatNum(totalProdHours)} h`} />
        <SummaryCard
          label="Kvalitātes kontrole (5%)"
          value={formatEUR(qualityCost)}
          sublabel={`${formatNum(totalProdHours * 0.05)} h`}
        />
        <SummaryCard label="Materiālu summa" value={formatEUR(materialsSummary.totalMaterialsCost)} />
        <SummaryCard label="Ražošanas summa" value={formatEUR(state.totalProductionCost)} highlight />
      </div>

      {/* Info about auto-linked values */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <strong>Metināšanas stundas no materiāliem:</strong> {formatNum(materialsSummary.totalWeldHours)} h
        (pamats: {formatNum(materialsSummary.totalWeldMeters)} m &times; 0.8 h/m)
      </div>

      {/* Production lines table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Ražošanas izmaksas</h2>
        <EditableTable
          columns={prodCols}
          rows={state.productionLines}
          onCellChange={(rowId, key, value) => {
            const idx = state.productionLines.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            dispatch({ type: "SET_PROD_LINE", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_PROD_LINE" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_PROD_LINE", id })}
          addLabel="Pievienot ražošanas rindu"
        />
      </section>

      {/* Discount & VAT */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Atlaide un PVN</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block text-muted mb-1">Atlaide (%)</label>
            <input
              type="number"
              min="0"
              max="23"
              step="0.1"
              value={state.discount || ""}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "discount", value: parseFloat(e.target.value) || 0 })}
              className="w-full border border-border rounded px-3 py-2 font-mono"
            />
            <span className="text-xs text-muted">Maks. 23%</span>
          </div>
          <div>
            <label className="block text-muted mb-1">Pirms atlaides</label>
            <div className="text-xl font-bold mt-1">{formatEUR(state.totalBeforeDiscount)}</div>
          </div>
          <div>
            <label className="block text-muted mb-1">Pirms PVN</label>
            <div className="text-xl font-bold mt-1">{formatEUR(state.totalBeforeVat)}</div>
          </div>
          <div>
            <label className="block text-muted mb-1">Kopā ar PVN ({state.vatRate}%)</label>
            <div className="text-2xl font-bold text-primary mt-1">{formatEUR(state.totalWithVat)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

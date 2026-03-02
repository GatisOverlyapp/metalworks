"use client";

import { useEstimateContext } from "@/components/EstimateProvider";
import { EditableTable, type Column } from "@/components/EditableTable";
import { SummaryCard } from "@/components/SummaryCard";
import { formatEUR, formatNum } from "@/lib/format";
import type { DeliveryLineState } from "@/lib/types";

const categoryOptions = [
  { value: "installation", label: "Montāža" },
  { value: "transport", label: "Transports" },
  { value: "mechanisms", label: "Mehānismi" },
];

const unitOptions = [
  { value: "h", label: "h" },
  { value: "km", label: "km" },
  { value: "kompl.", label: "kompl." },
  { value: "reiss", label: "reiss" },
];

const fmtEur = (v: number) => formatEUR(v);

const delCols: Column<DeliveryLineState>[] = [
  { key: "category", header: "Kategorija", type: "select", width: "140px", options: categoryOptions },
  { key: "name", header: "Nosaukums", type: "text", width: "240px" },
  { key: "unit", header: "Mērv.", type: "select", width: "80px", options: unitOptions },
  { key: "quantity", header: "Daudzums", type: "number", width: "90px" },
  { key: "unitPrice", header: "Cena EUR", type: "number", width: "100px" },
  { key: "totalCost", header: "Summa EUR", type: "number", width: "120px", readOnly: true, formatValue: fmtEur },
];

export default function DeliveryPage() {
  const { state, dispatch } = useEstimateContext();

  const installHours = state.deliveryLines
    .filter(l => l.category === "installation")
    .reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard label="Montāžas stundas" value={`${formatNum(installHours)} h`} />
        <SummaryCard label="Piegādes summa" value={formatEUR(state.totalDeliveryCost)} highlight />
        <SummaryCard label="Kopā ar ražošanu" value={formatEUR(state.totalProductionCost + state.totalDeliveryCost)} />
      </div>

      {/* Delivery lines table */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Piegādes un montāžas izmaksas</h2>
        <EditableTable
          columns={delCols}
          rows={state.deliveryLines}
          onCellChange={(rowId, key, value) => {
            const idx = state.deliveryLines.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            dispatch({ type: "SET_DEL_LINE", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_DEL_LINE" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_DEL_LINE", id })}
          addLabel="Pievienot piegādes rindu"
        />
      </section>
    </div>
  );
}

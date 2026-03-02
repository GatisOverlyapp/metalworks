"use client";

import { useEstimateContext } from "@/components/EstimateProvider";
import { EditableTable, type Column } from "@/components/EditableTable";
import { formatEUR, formatNum } from "@/lib/format";
import type { ProposalLineState } from "@/lib/types";

const fmtEur = (v: number) => formatEUR(v);

const propCols: Column<ProposalLineState>[] = [
  { key: "name", header: "Nosaukums", type: "text", width: "300px" },
  { key: "unit", header: "Mērv.", type: "text", width: "80px" },
  { key: "quantity", header: "Daudzums", type: "number", width: "90px" },
  { key: "unitPrice", header: "Cena EUR", type: "number", width: "110px" },
  { key: "totalCost", header: "Summa EUR", type: "number", width: "120px", readOnly: true, formatValue: fmtEur },
];

export default function ProposalPage() {
  const { state, dispatch } = useEstimateContext();

  return (
    <div className="space-y-8">
      {/* Company / Client info (editable) */}
      <div className="grid md:grid-cols-2 gap-6 no-print">
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Uzņēmuma dati</h3>
          <div className="space-y-2 text-sm">
            <Field label="Nosaukums" value={state.companyName} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyName", value: v })} />
            <Field label="Reģ. nr." value={state.companyReg} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyReg", value: v })} />
            <Field label="Adrese" value={state.companyAddr} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyAddr", value: v })} />
            <Field label="Tālrunis" value={state.companyPhone} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyPhone", value: v })} />
            <Field label="E-pasts" value={state.companyEmail} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyEmail", value: v })} />
            <Field label="Banka" value={state.companyBank} onChange={(v) => dispatch({ type: "SET_FIELD", field: "companyBank", value: v })} />
          </div>
        </section>
        <section className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Klienta dati</h3>
          <div className="space-y-2 text-sm">
            <Field label="Nosaukums" value={state.clientName} onChange={(v) => dispatch({ type: "SET_FIELD", field: "clientName", value: v })} />
            <Field label="Adrese" value={state.clientAddr} onChange={(v) => dispatch({ type: "SET_FIELD", field: "clientAddr", value: v })} />
            <Field label="Tālrunis" value={state.clientPhone} onChange={(v) => dispatch({ type: "SET_FIELD", field: "clientPhone", value: v })} />
            <Field label="E-pasts" value={state.clientEmail} onChange={(v) => dispatch({ type: "SET_FIELD", field: "clientEmail", value: v })} />
          </div>
        </section>
      </div>

      {/* Printable proposal header */}
      <div className="hidden print:block mb-8">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">{state.companyName || "Uzņēmums"}</h2>
            {state.companyReg && <p className="text-sm">Reģ. nr.: {state.companyReg}</p>}
            {state.companyAddr && <p className="text-sm">{state.companyAddr}</p>}
            {state.companyPhone && <p className="text-sm">Tālr.: {state.companyPhone}</p>}
            {state.companyEmail && <p className="text-sm">{state.companyEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Klients:</strong> {state.clientName}</p>
            {state.clientAddr && <p className="text-sm">{state.clientAddr}</p>}
            {state.clientPhone && <p className="text-sm">Tālr.: {state.clientPhone}</p>}
          </div>
        </div>
        <h1 className="text-xl font-bold text-center mb-4">
          Piedāvājums: {state.projectName}
        </h1>
      </div>

      {/* Project name */}
      <div className="no-print">
        <label className="block text-sm text-muted mb-1">Projekta nosaukums</label>
        <input
          type="text"
          value={state.projectName}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "projectName", value: e.target.value })}
          className="w-full border border-border rounded px-3 py-2 text-lg font-semibold"
          placeholder="Projekta nosaukums..."
        />
      </div>

      {/* Proposal lines */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Piedāvājuma pozīcijas</h2>
        <EditableTable
          columns={propCols}
          rows={state.proposalLines}
          onCellChange={(rowId, key, value) => {
            const idx = state.proposalLines.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            dispatch({ type: "SET_PROP_LINE", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_PROP_LINE" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_PROP_LINE", id })}
          addLabel="Pievienot pozīciju"
        />
      </section>

      {/* Totals */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-2 text-sm max-w-md ml-auto">
          <div className="flex justify-between">
            <span>Materiāli:</span>
            <span className="font-mono">{formatEUR(state.totalMaterialsCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ražošana:</span>
            <span className="font-mono">{formatEUR(state.totalProductionCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Piegāde:</span>
            <span className="font-mono">{formatEUR(state.totalDeliveryCost)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Kopā pirms atlaides:</span>
            <span className="font-mono font-semibold">{formatEUR(state.totalBeforeDiscount)}</span>
          </div>
          {state.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Atlaide ({formatNum(state.discount, 1)}%):</span>
              <span className="font-mono">-{formatEUR(state.totalDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Pirms PVN:</span>
            <span className="font-mono">{formatEUR(state.totalBeforeVat)}</span>
          </div>
          <div className="flex justify-between">
            <span>PVN ({state.vatRate}%):</span>
            <span className="font-mono">{formatEUR(state.totalVat)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-primary pt-2 text-lg font-bold text-primary">
            <span>KOPĀ:</span>
            <span className="font-mono">{formatEUR(state.totalWithVat)}</span>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="no-print">
        <label className="block text-sm text-muted mb-1">Piezīmes</label>
        <textarea
          value={state.notes}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "notes", value: e.target.value })}
          className="w-full border border-border rounded px-3 py-2 h-24 text-sm"
          placeholder="Papildu piezīmes piedāvājumam..."
        />
      </section>

      {/* Print button */}
      <div className="no-print">
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-2.5 rounded font-medium hover:bg-primary-light transition-colors"
        >
          Drukāt piedāvājumu
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-muted w-24 shrink-0">{label}:</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-border rounded px-2 py-1"
      />
    </div>
  );
}

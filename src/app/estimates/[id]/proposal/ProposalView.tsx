"use client";

import { useMemo } from "react";
import { fmtEur } from "@/lib/format";
import { calcMaterialSummary, type MaterialRow } from "@/lib/calc/summary";
import { calcProduction, calcDelivery } from "@/lib/calc/production";
import type { PartType } from "@/lib/calc/materials";

interface Estimate {
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
  jobs: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    jobType: string;
    productionDiscount: number;
    deliveryDiscount: number;
    materials: Array<Record<string, unknown>>;
    costLines: Array<Record<string, unknown>>;
  }>;
}

interface ProposalLine {
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  perUnit: number;
  total: number;
}

export function ProposalView({ estimate }: { estimate: Estimate }) {
  const proposalLines = useMemo(() => {
    const lines: ProposalLine[] = [];

    for (const job of estimate.jobs) {
      const materialRows = (job.materials as unknown as MaterialRow[]).map((m) => ({
        ...m,
        partType: (m.partType as PartType) || "flat",
      }));

      const summary = calcMaterialSummary(materialRows, job.quantity);

      const costLines = job.costLines as unknown as Array<{
        id: string;
        section: string;
        category: string;
        lineKey: string;
        label: string;
        quantity: number;
        rate: number;
        unit: string;
        autoLinked: boolean;
        isCorrection: boolean;
        sortOrder: number;
      }>;

      const production = calcProduction(costLines, summary, job.productionDiscount, job.quantity);
      const delivery = calcDelivery(costLines, summary, job.deliveryDiscount);

      const jobTotal = production.netProduction + delivery.netDelivery;
      const perUnit = job.quantity > 0 ? jobTotal / job.quantity : 0;

      lines.push({
        name: job.name,
        description: job.description,
        quantity: job.quantity,
        unit: "kompl.",
        perUnit: Math.ceil(perUnit * 100) / 100,
        total: Math.ceil(jobTotal * 100) / 100,
      });
    }

    return lines;
  }, [estimate]);

  const grandTotal = proposalLines.reduce((s, l) => s + l.total, 0);
  const vat = Math.ceil(grandTotal * 0.21 * 100) / 100;
  const totalWithVat = Math.ceil((grandTotal + vat) * 100) / 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="no-print mb-4 flex justify-end">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light text-sm"
        >
          Drukāt / PDF
        </button>
      </div>

      <div className="bg-white p-8 border border-border rounded-lg print:border-0 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {estimate.companyName && (
              <h2 className="text-lg font-bold">{estimate.companyName}</h2>
            )}
            {estimate.companyRegNr && (
              <p className="text-sm text-muted">Reģ.Nr. {estimate.companyRegNr}</p>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="text-muted">Datums: {new Date().toLocaleDateString("lv-LV")}</p>
            <p className="text-muted">Derīgs: {estimate.offerValidDays} dienas</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-center mb-6">PIEDĀVĀJUMS</h1>

        {/* Client info */}
        <div className="mb-6 text-sm">
          <p><strong>Projekts:</strong> {estimate.projectName}</p>
          {estimate.clientCompany && <p><strong>Klients:</strong> {estimate.clientCompany}</p>}
          {estimate.clientName && <p><strong>Kontaktpersona:</strong> {estimate.clientName}</p>}
          {estimate.clientPhone && <p><strong>Tālrunis:</strong> {estimate.clientPhone}</p>}
          {estimate.clientEmail && <p><strong>E-pasts:</strong> {estimate.clientEmail}</p>}
        </div>

        {/* Line items */}
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-left w-8">Nr.</th>
              <th className="py-2 text-left">Nosaukums</th>
              <th className="py-2 text-right w-16">Skaits</th>
              <th className="py-2 text-left w-16">Mērv.</th>
              <th className="py-2 text-right w-24">Cena/vien.</th>
              <th className="py-2 text-right w-24">Summa</th>
            </tr>
          </thead>
          <tbody>
            {proposalLines.map((line, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-2">{i + 1}</td>
                <td className="py-2">
                  <div>{line.name}</div>
                  {line.description && (
                    <div className="text-xs text-muted">{line.description}</div>
                  )}
                </td>
                <td className="py-2 text-right">{line.quantity}</td>
                <td className="py-2">{line.unit}</td>
                <td className="py-2 text-right font-mono">{fmtEur(line.perUnit)}</td>
                <td className="py-2 text-right font-mono font-semibold">{fmtEur(line.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-gray-800 pt-4 space-y-2 text-sm max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Kopā bez PVN:</span>
            <span className="font-mono font-semibold">{fmtEur(grandTotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>PVN 21%:</span>
            <span className="font-mono">{fmtEur(vat)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>KOPĀ ar PVN:</span>
            <span className="font-mono">{fmtEur(totalWithVat)}</span>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <div className="mt-8 text-sm">
            <p className="font-semibold mb-1">Piezīmes:</p>
            <p className="text-muted whitespace-pre-wrap">{estimate.notes}</p>
          </div>
        )}

        {estimate.advancePercent && (
          <div className="mt-4 text-sm">
            <p>Priekšapmaksa: {estimate.advancePercent}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

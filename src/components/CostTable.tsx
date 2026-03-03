"use client";

import { EditableCell } from "./EditableCell";
import { fmt, fmtEur } from "@/lib/format";
import type { CostLineCalc } from "@/lib/calc/production";

const CATEGORY_LABELS: Record<string, string> = {
  welding: "Metināšana",
  metalwork: "Metālapstrāde",
  assembly: "Montāža/Demontāža",
  design: "Projektēšana",
  qc: "Kvalitātes kontrole",
  sandblasting: "Smilšustrūkla",
  coating: "Krāsošana",
  transport: "Transports",
  materials: "Materiāli",
  plasma: "Plazma/Griešana",
  mechanisms: "Mehānismi",
  custom: "Pielāgots",
};

interface CostTableProps {
  lines: CostLineCalc[];
  total: number;
  onSetField: (id: string, field: string, value: unknown) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: (section: string, category: string, lineKey: string, label: string, rate: number, unit: string) => void;
  section: "production" | "delivery";
}

export function CostTable({ lines, total, onSetField, onDeleteLine, onAddLine, section }: CostTableProps) {
  // Group by category
  const categories = new Map<string, CostLineCalc[]>();
  for (const line of lines) {
    const cat = line.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(line);
  }

  return (
    <div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-border">
            <th className="px-2 py-1.5 text-left min-w-[200px]">Pozīcija</th>
            <th className="px-2 py-1.5 text-right w-20">Daudzums</th>
            <th className="px-2 py-1.5 text-left w-12">Vien.</th>
            <th className="px-2 py-1.5 text-right w-20">Likme</th>
            <th className="px-2 py-1.5 text-right w-24 bg-blue-50">Summa</th>
            <th className="px-2 py-1.5 w-6"></th>
          </tr>
        </thead>
        <tbody>
          {[...categories.entries()].map(([cat, catLines]) => (
            <CategoryGroup
              key={cat}
              category={cat}
              lines={catLines}
              onSetField={onSetField}
              onDeleteLine={onDeleteLine}
            />
          ))}
          <tr className="border-t-2 border-primary font-bold">
            <td colSpan={4} className="px-2 py-2 text-right">KOPĀ:</td>
            <td className="px-2 py-2 text-right bg-blue-50">{fmtEur(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2">
        <button
          onClick={() => onAddLine(section, "custom", `custom_${Date.now()}`, "Jauna pozīcija", 0, "st")}
          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light"
        >
          + Pievienot rindu
        </button>
      </div>
    </div>
  );
}

function CategoryGroup({
  category,
  lines,
  onSetField,
  onDeleteLine,
}: {
  category: string;
  lines: CostLineCalc[];
  onSetField: (id: string, field: string, value: unknown) => void;
  onDeleteLine: (id: string) => void;
}) {
  const categoryTotal = lines.reduce((sum, l) => sum + l.lineCost, 0);

  return (
    <>
      <tr className="bg-gray-50">
        <td colSpan={5} className="px-2 py-1 font-semibold text-muted text-[10px] uppercase tracking-wider">
          {CATEGORY_LABELS[category] || category}
        </td>
        <td className="px-2 py-1 text-right text-[10px] text-muted font-mono">{fmtEur(categoryTotal)}</td>
      </tr>
      {lines.map((line) => (
        <tr key={line.id} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="px-2 py-0.5">
            <EditableCell value={line.label} onChange={(v) => onSetField(line.id, "label", v)} />
          </td>
          <td className="px-2 py-0.5">
            {line.autoLinked ? (
              <span className="text-right block font-mono text-muted">{fmt(line.computedQuantity, 2)}</span>
            ) : (
              <EditableCell value={line.quantity} onChange={(v) => onSetField(line.id, "quantity", Number(v))} type="number" className="text-right" />
            )}
          </td>
          <td className="px-2 py-0.5 text-muted">{line.unit}</td>
          <td className="px-2 py-0.5">
            <EditableCell value={line.rate} onChange={(v) => onSetField(line.id, "rate", Number(v))} type="number" className="text-right" />
          </td>
          <td className="px-2 py-0.5 text-right bg-blue-50 font-mono">{fmtEur(line.lineCost)}</td>
          <td className="px-2 py-0.5">
            <button
              onClick={() => onDeleteLine(line.id)}
              className="text-danger hover:text-red-800 text-sm"
              title="Dzēst"
            >
              ×
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

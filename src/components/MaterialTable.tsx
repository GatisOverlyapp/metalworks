"use client";

import { EditableCell } from "./EditableCell";
import { fmt, fmtEur } from "@/lib/format";
import type { MaterialItemData } from "@/lib/types";
import type { MaterialCalcResult, PartType } from "@/lib/calc/materials";

const PART_TYPE_OPTIONS: { value: PartType; label: string }[] = [
  { value: "flat", label: "Loksne" },
  { value: "round_tube", label: "Apaļā caurule" },
  { value: "rect_tube", label: "Taisnst. caurule" },
  { value: "shs", label: "SHS" },
  { value: "rhs", label: "RHS" },
  { value: "solid_round", label: "Apaļš stiegra" },
  { value: "angle", label: "Leņķis" },
  { value: "strip", label: "Josla" },
  { value: "auxiliary", label: "Palīgmat." },
  { value: "wood", label: "Koks" },
  { value: "other", label: "Cits" },
];

const MATERIAL_OPTIONS = [
  { value: "steel", label: "Tērauds" },
  { value: "stainless", label: "Nerūs. tērauds" },
  { value: "aluminium", label: "Alumīnijs" },
  { value: "copper", label: "Varš" },
  { value: "brass", label: "Misiņš" },
  { value: "wood", label: "Koks" },
];

interface MaterialTableProps {
  materials: MaterialItemData[];
  calcResults: Map<string, MaterialCalcResult>;
  onSetField: (id: string, field: string, value: unknown) => void;
  onAddRow: (partType?: string) => void;
  onDeleteRow: (id: string) => void;
}

function needsWidth(pt: string) {
  return ["flat", "strip", "rect_tube", "shs", "rhs", "angle"].includes(pt);
}
function needsSideB(pt: string) {
  return ["rect_tube", "rhs", "angle"].includes(pt);
}
function needsOuterDiam(pt: string) {
  return ["round_tube"].includes(pt);
}
function needsThickness(pt: string) {
  return !["auxiliary", "wood", "other"].includes(pt);
}
function isSimpleType(pt: string) {
  return ["auxiliary", "wood", "other"].includes(pt);
}

export function MaterialTable({ materials, calcResults, onSetField, onAddRow, onDeleteRow }: MaterialTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-border">
            <th className="px-1 py-1 text-left w-6">#</th>
            <th className="px-1 py-1 text-left w-8">Tips</th>
            <th className="px-1 py-1 text-left min-w-[120px]">Nosaukums</th>
            <th className="px-1 py-1 text-left w-16">Piez.</th>
            <th className="px-1 py-1 text-right w-12">Skaits</th>
            <th className="px-1 py-1 text-right w-14">Platums</th>
            <th className="px-1 py-1 text-right w-14">Garums</th>
            <th className="px-1 py-1 text-right w-14">Puse B</th>
            <th className="px-1 py-1 text-right w-14">Biezums</th>
            <th className="px-1 py-1 text-right w-14">Ārēj.Ø</th>
            <th className="px-1 py-1 text-left w-16">Materiāls</th>
            <th className="px-1 py-1 text-right w-14">Cena/vien.</th>
            <th className="px-1 py-1 text-right w-10">Atk.%</th>
            <th className="px-1 py-1 text-right w-14 bg-blue-50">Kg</th>
            <th className="px-1 py-1 text-right w-14 bg-blue-50">m²</th>
            <th className="px-1 py-1 text-right w-16 bg-blue-50">Izmaksas</th>
            <th className="px-1 py-1 text-right w-12">Met.L</th>
            <th className="px-1 py-1 text-right w-10">Met.st</th>
            <th className="px-1 py-1 text-right w-10">Slīp.</th>
            <th className="px-1 py-1 text-right w-10">Gar.</th>
            <th className="px-1 py-1 text-right w-10">Valc.</th>
            <th className="px-1 py-1 text-right w-10">Urb.</th>
            <th className="px-1 py-1 w-6"></th>
          </tr>
        </thead>
        <tbody>
          {materials.map((mat, idx) => {
            const calc = calcResults.get(mat.id);
            const simple = isSimpleType(mat.partType);
            return (
              <tr key={mat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-1 py-0.5 text-muted">{idx + 1}</td>
                <td className="px-1 py-0.5">
                  <select
                    value={mat.partType}
                    onChange={(e) => onSetField(mat.id, "partType", e.target.value)}
                    className="w-full text-xs border-0 bg-transparent p-0"
                  >
                    {PART_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.name} onChange={(v) => onSetField(mat.id, "name", v)} placeholder="Nosaukums" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.notes ?? ""} onChange={(v) => onSetField(mat.id, "notes", v || null)} placeholder="—" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.pcsPerUnit} onChange={(v) => onSetField(mat.id, "pcsPerUnit", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  {needsWidth(mat.partType) ? (
                    <EditableCell value={mat.width} onChange={(v) => onSetField(mat.id, "width", Number(v))} type="number" className="text-right" placeholder="mm" />
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-1 py-0.5">
                  {!simple ? (
                    <EditableCell value={mat.length} onChange={(v) => onSetField(mat.id, "length", Number(v))} type="number" className="text-right" placeholder="mm" />
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-1 py-0.5">
                  {needsSideB(mat.partType) ? (
                    <EditableCell value={mat.sideB} onChange={(v) => onSetField(mat.id, "sideB", Number(v))} type="number" className="text-right" placeholder="mm" />
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-1 py-0.5">
                  {needsThickness(mat.partType) ? (
                    <EditableCell value={mat.thickness} onChange={(v) => onSetField(mat.id, "thickness", Number(v))} type="number" className="text-right" placeholder="mm" />
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-1 py-0.5">
                  {needsOuterDiam(mat.partType) ? (
                    <EditableCell value={mat.outerDiam} onChange={(v) => onSetField(mat.id, "outerDiam", Number(v))} type="number" className="text-right" placeholder="mm" />
                  ) : <span className="text-gray-200">—</span>}
                </td>
                <td className="px-1 py-0.5">
                  <select
                    value={mat.materialKey}
                    onChange={(e) => onSetField(mat.id, "materialKey", e.target.value)}
                    className="w-full text-xs border-0 bg-transparent p-0"
                  >
                    {MATERIAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.pricePerUnit} onChange={(v) => onSetField(mat.id, "pricePerUnit", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.wasteMarkup * 100} onChange={(v) => onSetField(mat.id, "wasteMarkup", Number(v) / 100)} type="number" className="text-right" />
                </td>
                {/* Calculated columns */}
                <td className="px-1 py-0.5 text-right bg-blue-50 font-mono">{calc ? fmt(calc.totalKg, 1) : "—"}</td>
                <td className="px-1 py-0.5 text-right bg-blue-50 font-mono">{calc ? fmt(calc.surfaceM2, 2) : "—"}</td>
                <td className="px-1 py-0.5 text-right bg-blue-50 font-mono font-semibold">{calc ? fmtEur(calc.materialCost) : "—"}</td>
                {/* Work hours */}
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.weldingLength} onChange={(v) => onSetField(mat.id, "weldingLength", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.weldingHours} onChange={(v) => onSetField(mat.id, "weldingHours", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.grindingHours} onChange={(v) => onSetField(mat.id, "grindingHours", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.strainingHours} onChange={(v) => onSetField(mat.id, "strainingHours", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.rollingHours} onChange={(v) => onSetField(mat.id, "rollingHours", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <EditableCell value={mat.drillingHours} onChange={(v) => onSetField(mat.id, "drillingHours", Number(v))} type="number" className="text-right" />
                </td>
                <td className="px-1 py-0.5">
                  <button
                    onClick={() => onDeleteRow(mat.id)}
                    className="text-danger hover:text-red-800 text-sm"
                    title="Dzēst rindu"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onAddRow("flat")}
          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light"
        >
          + Loksne
        </button>
        <button
          onClick={() => onAddRow("round_tube")}
          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light"
        >
          + Caurule
        </button>
        <button
          onClick={() => onAddRow("rect_tube")}
          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light"
        >
          + Profils
        </button>
        <button
          onClick={() => onAddRow("auxiliary")}
          className="px-3 py-1 text-xs bg-accent text-white rounded hover:opacity-80"
        >
          + Palīgmat.
        </button>
      </div>
    </div>
  );
}

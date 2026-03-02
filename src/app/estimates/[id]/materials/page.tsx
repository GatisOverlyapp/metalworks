"use client";

import { useEstimateContext } from "@/components/EstimateProvider";
import { EditableTable, type Column } from "@/components/EditableTable";
import { SummaryCard } from "@/components/SummaryCard";
import { formatEUR, formatNum } from "@/lib/format";
import type { FlatSheetPartState, TubeProfilePartState, AuxiliaryItemState } from "@/lib/types";

const materialOptions = [
  { value: "S235", label: "S235" },
  { value: "S355", label: "S355" },
  { value: "SS304", label: "SS304" },
  { value: "SS316", label: "SS316" },
  { value: "AL6061", label: "AL6061" },
  { value: "AL5052", label: "AL5052" },
];

const profileTypeOptions = [
  { value: "shs", label: "SHS (kvadrāt)" },
  { value: "rhs", label: "RHS (taisnstūris)" },
  { value: "round_tube", label: "Apaļā caurule" },
  { value: "solid_round", label: "Apaļais stieņis" },
  { value: "angle", label: "Leņķis" },
  { value: "channel", label: "Švelleris" },
];

const densityMap: Record<string, number> = {
  S235: 7850, S355: 7850, SS304: 7930, SS316: 8000, AL6061: 2700, AL5052: 2680,
};

const fmtEur = (v: number) => formatEUR(v);
const fmtNum2 = (v: number) => formatNum(v);

const flatSheetCols: Column<FlatSheetPartState>[] = [
  { key: "name", header: "Nosaukums", type: "text", width: "160px" },
  { key: "quantity", header: "Skaits", type: "number", width: "60px", step: "1" },
  { key: "width", header: "Platums mm", type: "number", width: "85px" },
  { key: "length", header: "Garums mm", type: "number", width: "85px" },
  { key: "thickness", header: "Biezums mm", type: "number", width: "80px" },
  { key: "material", header: "Materiāls", type: "select", width: "90px", options: materialOptions },
  { key: "pricePerKg", header: "EUR/kg", type: "number", width: "75px" },
  { key: "weldMeters", header: "Met. m/gab", type: "number", width: "80px" },
  { key: "surfaceArea", header: "m²", type: "number", width: "65px", readOnly: true, formatValue: fmtNum2 },
  { key: "totalKg", header: "kg", type: "number", width: "70px", readOnly: true, formatValue: fmtNum2 },
  { key: "totalCost", header: "Summa EUR", type: "number", width: "90px", readOnly: true, formatValue: fmtEur },
];

const tubeProfileCols: Column<TubeProfilePartState>[] = [
  { key: "name", header: "Nosaukums", type: "text", width: "140px" },
  { key: "profileType", header: "Profils", type: "select", width: "120px", options: profileTypeOptions },
  { key: "quantity", header: "Skaits", type: "number", width: "55px", step: "1" },
  { key: "lengthMm", header: "Garums mm", type: "number", width: "80px" },
  { key: "dimA", header: "A mm", type: "number", width: "65px" },
  { key: "dimB", header: "B mm", type: "number", width: "65px" },
  { key: "thickness", header: "t mm", type: "number", width: "60px" },
  { key: "material", header: "Mat.", type: "select", width: "80px", options: materialOptions },
  { key: "pricePerKg", header: "EUR/kg", type: "number", width: "70px" },
  { key: "weldMeters", header: "Met. m", type: "number", width: "65px" },
  { key: "kgPerM", header: "kg/m", type: "number", width: "60px", readOnly: true, formatValue: fmtNum2 },
  { key: "orderLengthM", header: "Pas. m", type: "number", width: "60px", readOnly: true, formatValue: fmtNum2 },
  { key: "totalKg", header: "kg", type: "number", width: "65px", readOnly: true, formatValue: fmtNum2 },
  { key: "totalCost", header: "Summa", type: "number", width: "85px", readOnly: true, formatValue: fmtEur },
];

const auxCols: Column<AuxiliaryItemState>[] = [
  { key: "name", header: "Nosaukums", type: "text", width: "240px" },
  { key: "quantity", header: "Skaits", type: "number", width: "70px", step: "1" },
  { key: "unit", header: "Mērv.", type: "text", width: "70px" },
  { key: "unitPrice", header: "Cena EUR", type: "number", width: "90px" },
  { key: "totalCost", header: "Summa EUR", type: "number", width: "100px", readOnly: true, formatValue: fmtEur },
  { key: "notes", header: "Piezīmes", type: "text", width: "160px" },
];

export default function MaterialsPage() {
  const { state, dispatch, materialsSummary } = useEstimateContext();

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Kopējā masa" value={`${formatNum(materialsSummary.totalKg)} kg`} />
        <SummaryCard label="Virsma" value={`${formatNum(materialsSummary.totalSurfaceM2)} m²`} />
        <SummaryCard label="Metināšana" value={`${formatNum(materialsSummary.totalWeldHours)} h`} sublabel={`${formatNum(materialsSummary.totalWeldMeters)} m`} />
        <SummaryCard label="Materiālu summa" value={formatEUR(materialsSummary.totalMaterialsCost)} highlight />
      </div>

      {/* Flat sheet section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Loksnes / plakanie elementi</h2>
        <EditableTable
          columns={flatSheetCols}
          rows={state.flatSheetParts}
          onCellChange={(rowId, key, value) => {
            const idx = state.flatSheetParts.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            // Auto-set density when material changes
            if (key === "material" && typeof value === "string") {
              dispatch({ type: "SET_FLAT_SHEET", index: idx, field: "density", value: densityMap[value] || 7850 });
            }
            dispatch({ type: "SET_FLAT_SHEET", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_FLAT_SHEET" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_FLAT_SHEET", id })}
          addLabel="Pievienot loksni"
        />
      </section>

      {/* Tube/profile section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Caurules / profili</h2>
        <EditableTable
          columns={tubeProfileCols}
          rows={state.tubeProfileParts}
          onCellChange={(rowId, key, value) => {
            const idx = state.tubeProfileParts.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            if (key === "material" && typeof value === "string") {
              dispatch({ type: "SET_TUBE_PROFILE", index: idx, field: "density", value: densityMap[value] || 7850 });
            }
            dispatch({ type: "SET_TUBE_PROFILE", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_TUBE_PROFILE" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_TUBE_PROFILE", id })}
          addLabel="Pievienot profilu"
        />
      </section>

      {/* Auxiliary items section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Papildmateriāli / furnitūra</h2>
        <EditableTable
          columns={auxCols}
          rows={state.auxiliaryItems}
          onCellChange={(rowId, key, value) => {
            const idx = state.auxiliaryItems.findIndex(p => p.id === rowId);
            if (idx === -1) return;
            dispatch({ type: "SET_AUX_ITEM", index: idx, field: key, value });
          }}
          onAddRow={() => dispatch({ type: "ADD_AUX_ITEM" })}
          onDeleteRow={(id) => dispatch({ type: "DEL_AUX_ITEM", id })}
          addLabel="Pievienot materiālu"
        />
      </section>
    </div>
  );
}

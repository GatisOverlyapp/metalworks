"use client";

import { useJob } from "@/components/JobProvider";
import { MaterialTable } from "@/components/MaterialTable";
import { SummaryBar } from "@/components/SummaryBar";
import type { MaterialCalcResult } from "@/lib/calc/materials";

export default function MaterialsPage() {
  const { job, dispatch, materialSummary } = useJob();

  // Build calc results map from summary rows
  const calcResults = new Map<string, MaterialCalcResult>();
  for (const row of materialSummary.rows) {
    calcResults.set(row.id, row.calc);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">MATERIĀLI</h2>
      <MaterialTable
        materials={job.materials}
        calcResults={calcResults}
        onSetField={(id, field, value) =>
          dispatch({ type: "SET_MATERIAL_FIELD", id, field, value })
        }
        onAddRow={(partType) =>
          dispatch({ type: "ADD_MATERIAL_ROW", partType })
        }
        onDeleteRow={(id) =>
          dispatch({ type: "DELETE_MATERIAL_ROW", id })
        }
      />
      <SummaryBar summary={materialSummary} />
    </div>
  );
}

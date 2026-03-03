"use client";

import { useJob } from "@/components/JobProvider";
import { CostTable } from "@/components/CostTable";
import { DiscountVatBlock } from "@/components/DiscountVatBlock";

export default function ProductionPage() {
  const { job, dispatch, productionResult } = useJob();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">RAŽOŠANA</h2>
      <CostTable
        lines={productionResult.lines}
        total={productionResult.productionTotal}
        section="production"
        onSetField={(id, field, value) =>
          dispatch({ type: "SET_COST_LINE_FIELD", id, field, value })
        }
        onDeleteLine={(id) => dispatch({ type: "DELETE_COST_LINE", id })}
        onAddLine={(section, category, lineKey, label, rate, unit) =>
          dispatch({ type: "ADD_COST_LINE", section, category, lineKey, label, rate, unit })
        }
      />
      <DiscountVatBlock
        subtotal={productionResult.productionTotal}
        discount={job.productionDiscount}
        discountAmount={productionResult.discountAmount}
        netTotal={productionResult.netProduction}
        perUnit={productionResult.perUnitProduction}
        vatAmount={productionResult.vatAmount}
        totalWithVat={productionResult.totalWithVat}
        onChangeDiscount={(v) => dispatch({ type: "SET_JOB_META", field: "productionDiscount", value: v })}
        label="Ražošana"
      />
    </div>
  );
}

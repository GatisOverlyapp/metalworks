"use client";

import { useJob } from "@/components/JobProvider";
import { CostTable } from "@/components/CostTable";
import { DiscountVatBlock } from "@/components/DiscountVatBlock";

export default function DeliveryPage() {
  const { job, dispatch, deliveryResult } = useJob();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">PIEGĀDE</h2>
      <CostTable
        lines={deliveryResult.lines}
        total={deliveryResult.deliveryTotal}
        section="delivery"
        onSetField={(id, field, value) =>
          dispatch({ type: "SET_COST_LINE_FIELD", id, field, value })
        }
        onDeleteLine={(id) => dispatch({ type: "DELETE_COST_LINE", id })}
        onAddLine={(section, category, lineKey, label, rate, unit) =>
          dispatch({ type: "ADD_COST_LINE", section, category, lineKey, label, rate, unit })
        }
      />
      <DiscountVatBlock
        subtotal={deliveryResult.deliveryTotal}
        discount={job.deliveryDiscount}
        discountAmount={deliveryResult.discountAmount}
        netTotal={deliveryResult.netDelivery}
        vatAmount={deliveryResult.vatAmount}
        totalWithVat={deliveryResult.totalWithVat}
        onChangeDiscount={(v) => dispatch({ type: "SET_JOB_META", field: "deliveryDiscount", value: v })}
        label="Piegāde"
      />
    </div>
  );
}

"use client";

import { fmtEur, fmtPct } from "@/lib/format";

interface DiscountVatBlockProps {
  subtotal: number;
  discount: number;
  discountAmount: number;
  netTotal: number;
  perUnit?: number;
  vatAmount: number;
  totalWithVat: number;
  onChangeDiscount: (v: number) => void;
  label?: string;
}

export function DiscountVatBlock({
  subtotal,
  discount,
  discountAmount,
  netTotal,
  perUnit,
  vatAmount,
  totalWithVat,
  onChangeDiscount,
  label = "Ražošana",
}: DiscountVatBlockProps) {
  return (
    <div className="mt-4 p-4 bg-card border border-border rounded-lg max-w-md ml-auto">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{label} kopā:</span>
          <span className="font-mono">{fmtEur(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Atlaide:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={23}
              step={0.5}
              value={(discount * 100).toFixed(1)}
              onChange={(e) => {
                const v = Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 23);
                onChangeDiscount(v / 100);
              }}
              className="w-16 text-right px-1 py-0.5 border border-border rounded text-sm"
            />
            <span className="text-muted">%</span>
            <span className="font-mono text-danger">-{fmtEur(discountAmount)}</span>
          </div>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Neto:</span>
          <span className="font-mono">{fmtEur(netTotal)}</span>
        </div>
        {perUnit !== undefined && (
          <div className="flex justify-between text-muted">
            <span>Par vienību:</span>
            <span className="font-mono">{fmtEur(perUnit)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <span>PVN 21%:</span>
          <span className="font-mono">{fmtEur(vatAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Kopā ar PVN:</span>
          <span className="font-mono text-primary">{fmtEur(totalWithVat)}</span>
        </div>
      </div>
    </div>
  );
}

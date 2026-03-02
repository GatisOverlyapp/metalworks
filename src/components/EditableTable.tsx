"use client";

import { useCallback } from "react";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  type: "text" | "number" | "select";
  width?: string;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
  formatValue?: (val: number) => string;
}

interface EditableTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  onCellChange: (rowId: string, key: string, value: string | number) => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: string) => void;
  addLabel?: string;
}

export function EditableTable<T extends { id: string }>({
  columns,
  rows,
  onCellChange,
  onAddRow,
  onDeleteRow,
  addLabel = "Pievienot rindu",
}: EditableTableProps<T>) {
  const handleChange = useCallback(
    (rowId: string, key: string, value: string, type: string) => {
      if (type === "number") {
        onCellChange(rowId, key, value === "" ? 0 : parseFloat(value));
      } else {
        onCellChange(rowId, key, value);
      }
    },
    [onCellChange]
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-border px-2 py-1.5 text-left font-medium text-muted w-8">#</th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-border px-2 py-1.5 text-left font-medium text-muted"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            <th className="border border-border px-2 py-1.5 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className="hover:bg-blue-50/50">
              <td className="border border-border px-2 py-1 text-muted text-center">{idx + 1}</td>
              {columns.map((col) => {
                const val = row[col.key];
                if (col.readOnly) {
                  const displayVal = col.formatValue && typeof val === "number"
                    ? col.formatValue(val)
                    : String(val ?? "");
                  return (
                    <td key={col.key} className="border border-border px-2 py-1 bg-gray-50 text-right font-mono">
                      {displayVal}
                    </td>
                  );
                }
                if (col.type === "select") {
                  return (
                    <td key={col.key} className="border border-border p-0">
                      <select
                        value={String(val)}
                        onChange={(e) => handleChange(row.id, col.key, e.target.value, "text")}
                        className="w-full px-2 py-1 border-0 bg-transparent focus:ring-1 focus:ring-primary-light outline-none"
                      >
                        {col.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                }
                return (
                  <td key={col.key} className="border border-border p-0">
                    <input
                      type={col.type}
                      value={col.type === "number" && val === 0 ? "" : String(val ?? "")}
                      placeholder={col.type === "number" ? "0" : ""}
                      step={col.step || (col.type === "number" ? "any" : undefined)}
                      onChange={(e) => handleChange(row.id, col.key, e.target.value, col.type)}
                      className={`w-full px-2 py-1 border-0 bg-transparent focus:ring-1 focus:ring-primary-light outline-none ${
                        col.type === "number" ? "text-right font-mono" : ""
                      }`}
                    />
                  </td>
                );
              })}
              <td className="border border-border px-1 py-1 text-center">
                <button
                  onClick={() => onDeleteRow(row.id)}
                  className="text-red-400 hover:text-danger transition-colors px-1"
                  title="Dzēst rindu"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={onAddRow}
        className="mt-2 px-3 py-1.5 text-sm text-primary hover:bg-blue-50 rounded transition-colors border border-dashed border-blue-300"
      >
        + {addLabel}
      </button>
    </div>
  );
}

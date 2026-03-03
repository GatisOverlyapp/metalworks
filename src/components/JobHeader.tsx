"use client";

import { EditableCell } from "./EditableCell";

interface JobHeaderProps {
  name: string;
  quantity: number;
  jobType: string;
  onChangeName: (v: string) => void;
  onChangeQuantity: (v: number) => void;
  onChangeJobType: (v: string) => void;
}

export function JobHeader({ name, quantity, jobType, onChangeName, onChangeQuantity, onChangeJobType }: JobHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-4 p-3 bg-card rounded-lg border border-border">
      <div className="flex-1">
        <label className="text-xs text-muted block mb-0.5">Darba nosaukums</label>
        <EditableCell value={name} onChange={(v) => onChangeName(String(v))} className="font-semibold text-lg" />
      </div>
      <div className="w-24">
        <label className="text-xs text-muted block mb-0.5">SKAITS KOPĀ</label>
        <EditableCell value={quantity} onChange={(v) => onChangeQuantity(Number(v))} type="number" className="font-bold text-center text-lg" />
      </div>
      <div className="w-32">
        <label className="text-xs text-muted block mb-0.5">Tips</label>
        <select
          value={jobType}
          onChange={(e) => onChangeJobType(e.target.value)}
          className="w-full px-2 py-1 border border-border rounded text-sm"
        >
          <option value="full">Pilns (Mat+Raž+Pieg)</option>
          <option value="simple">Vienkāršs</option>
        </select>
      </div>
    </div>
  );
}

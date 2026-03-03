"use client";

import { useState, useRef, useEffect } from "react";

interface EditableCellProps {
  value: string | number | null;
  onChange: (value: string | number) => void;
  type?: "text" | "number";
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function EditableCell({
  value,
  onChange,
  type = "text",
  className = "",
  disabled = false,
  placeholder = "",
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value ?? ""));
    }
  }, [value, editing]);

  function commit() {
    setEditing(false);
    if (type === "number") {
      const num = parseFloat(draft);
      if (!isNaN(num)) onChange(num);
      else if (draft === "") onChange(0);
    } else {
      onChange(draft);
    }
  }

  if (disabled) {
    return (
      <span className={`block px-1 py-0.5 text-muted ${className}`}>
        {value ?? "—"}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        className={`block px-1 py-0.5 cursor-pointer hover:bg-blue-50 rounded min-h-[1.5rem] ${className}`}
        onClick={() => setEditing(true)}
      >
        {value !== null && value !== "" && value !== 0 ? value : <span className="text-gray-300">{placeholder || "—"}</span>}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setEditing(false); setDraft(String(value ?? "")); }
      }}
      className={`block w-full px-1 py-0.5 border border-primary rounded text-sm outline-none ${className}`}
      step={type === "number" ? "any" : undefined}
    />
  );
}

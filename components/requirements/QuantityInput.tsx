"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/requirements-store";

interface QuantityInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Called with a valid number when the field loses focus or a step button is used. */
  onCommit?: (value: number) => void;
  invalid?: boolean;
  describedBy?: string;
  label?: string;
}

export function parseQuantity(value: string): number | null {
  const number = Number(value.replace(",", ".").trim());
  if (!Number.isFinite(number) || number <= 0 || number > MAX_QUANTITY) return null;
  return Math.round(number * 100) / 100;
}

/** Number field with − / + buttons. Accepts decimals (2.5 kg, 12.5 ft). */
export function QuantityInput({ id, value, onChange, onCommit, invalid, describedBy, label }: QuantityInputProps) {
  const current = parseQuantity(value) ?? 0;

  const step = (delta: number) => {
    const next = Math.max(1, Math.floor(current) + delta);
    const rounded = delta < 0 && current > 1 && !Number.isInteger(current) ? Math.floor(current) : next;
    onChange(String(rounded));
    onCommit?.(rounded);
  };

  return (
    <div className="flex h-12 items-stretch">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={current <= 1}
        aria-label={`Decrease ${label ?? "quantity"}`}
        className="flex w-12 shrink-0 items-center justify-center rounded-l-[2px] border border-r-0 border-line-strong bg-paper text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-line-strong"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={() => {
          const parsed = parseQuantity(value);
          if (parsed !== null) onCommit?.(parsed);
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="field min-w-0 flex-1 rounded-none text-center tabular"
      />
      <button
        type="button"
        onClick={() => step(1)}
        disabled={current >= MAX_QUANTITY}
        aria-label={`Increase ${label ?? "quantity"}`}
        className="flex w-12 shrink-0 items-center justify-center rounded-r-[2px] border border-l-0 border-line-strong bg-paper text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-line-strong"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

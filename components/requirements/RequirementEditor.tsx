"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useId, useState } from "react";
import type { ProductRef } from "@/types/catalog";
import type { RequirementItem } from "@/types/requirements";
import { announce } from "@/lib/announce";
import { routes } from "@/lib/routes";
import { removeRequirement, saveRequirement, useHydrated, useRequirement } from "@/lib/requirements-store";
import { formatAmount, formatQuantity } from "@/lib/units";
import { parseQuantity, QuantityInput } from "./QuantityInput";

/** Quantity, unit and notes for one product, with "Add to requirements". */
export function RequirementEditor({ product }: { product: ProductRef }) {
  const hydrated = useHydrated();
  const existing = useRequirement(product.id);
  // Mount once more after hydration so the form starts from the saved quantity, unit and notes.
  return <EditorForm key={hydrated ? "client" : "server"} product={product} existing={hydrated ? existing : undefined} />;
}

function EditorForm({ product, existing }: { product: ProductRef; existing?: RequirementItem }) {
  const id = useId();
  const [quantity, setQuantity] = useState(existing ? formatQuantity(existing.quantity) : "1");
  const [unit, setUnit] = useState(existing?.unit ?? product.units[0] ?? "Pieces");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<"added" | "updated" | null>(null);

  const units = product.units.includes(unit) ? product.units : [unit, ...product.units];

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseQuantity(quantity);
    if (parsed === null) {
      setError("Enter a quantity greater than 0.");
      document.getElementById(`${id}-qty`)?.focus();
      return;
    }
    setError("");
    const result = saveRequirement(product, { quantity: parsed, unit, notes });
    setSaved(result);
    announce(
      result === "added"
        ? `${product.name} added to your requirements: ${formatAmount(parsed, unit)}.`
        : `Requirement updated: ${formatAmount(parsed, unit)}.`,
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="border border-line bg-paper p-5 sm:p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-name-sm font-medium">
        Your requirement
      </h2>
      <p className="mt-1 text-body text-muted">Set the quantity you need. We confirm prices and stock on WhatsApp.</p>

      <div className="mt-5 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-3">
        <div>
          <label htmlFor={`${id}-qty`} className="label">
            Quantity
          </label>
          <QuantityInput
            id={`${id}-qty`}
            value={quantity}
            onChange={(value) => {
              setQuantity(value);
              setSaved(null);
            }}
            invalid={Boolean(error)}
            describedBy={error ? `${id}-qty-error` : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${id}-unit`} className="label">
            Unit
          </label>
          <select
            id={`${id}-unit`}
            value={unit}
            onChange={(event) => {
              setUnit(event.target.value);
              setSaved(null);
            }}
            className="field"
          >
            {units.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <p id={`${id}-qty-error`} className="mt-2 text-small text-danger">
          {error}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor={`${id}-notes`} className="label">
          Notes <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={`${id}-notes`}
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
            setSaved(null);
          }}
          rows={3}
          maxLength={500}
          placeholder="For example: size, finish or colour, or “I need this for a 2-floor house”."
          className="field"
        />
      </div>

      <button type="submit" className="btn btn-primary mt-5 w-full">
        {existing ? "Update requirement" : "Add to requirements"}
      </button>

      <div role="status" className="min-h-6">
        {saved && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-body">
            <Check className="size-4 text-accent" aria-hidden="true" />
            {saved === "added" ? "Added to your requirements." : "Requirement updated."}
            <Link href={routes.requirements} className="link inline-flex items-center gap-1 font-medium">
              View my requirements
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        )}
      </div>

      {existing && !saved && (
        <p className="mt-2 text-small text-muted">
          In your list: {formatAmount(existing.quantity, existing.unit)}.{" "}
          <button
            type="button"
            className="link text-ink"
            onClick={() => {
              removeRequirement(product.id);
              announce(`${product.name} removed from your requirements.`);
            }}
          >
            Remove
          </button>
        </p>
      )}
    </form>
  );
}

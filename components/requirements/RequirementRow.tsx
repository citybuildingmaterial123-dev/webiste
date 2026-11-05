"use client";

/* eslint-disable @next/next/no-img-element -- static export: thumbnails are pre-resized WebP files. */
import Link from "next/link";
import { Package, Trash } from "lucide-react";
import { useId, useState } from "react";
import type { RequirementItem } from "@/types/requirements";
import { announce } from "@/lib/announce";
import { routes } from "@/lib/routes";
import { removeRequirement, updateRequirement } from "@/lib/requirements-store";
import { formatQuantity } from "@/lib/units";
import { QuantityInput } from "./QuantityInput";

/** One editable line in "My requirements". Changes are saved as you type. */
export function RequirementRow({ item, index }: { item: RequirementItem; index: number }) {
  const id = useId();
  const [quantity, setQuantity] = useState(formatQuantity(item.quantity));
  const [showNotes, setShowNotes] = useState(Boolean(item.notes));
  const units = item.units.includes(item.unit) ? item.units : [item.unit, ...item.units];

  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-line py-6 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-x-6">
      <div className="size-16 overflow-hidden border border-line bg-paper sm:size-[88px]">
        {item.thumb ? (
          <img src={item.thumb} alt="" width={88} height={88} className="h-full w-full object-contain p-1.5" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface text-muted" aria-hidden="true">
            <Package className="size-6 opacity-70" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-label text-muted">
          {index + 1}. {item.subcategoryName ? `${item.categoryName} › ${item.subcategoryName}` : item.categoryName}
        </p>
        <h3 className="mt-1 text-body font-medium">
          <Link href={routes.product(item.slug)} className="link">
            {item.name}
          </Link>
        </h3>
        {item.brand && <p className="text-small text-muted">{item.brand}</p>}
      </div>

      <div className="col-span-2 grid gap-3 sm:col-span-1 sm:col-start-2 sm:grid-cols-[minmax(0,200px)_minmax(0,160px)_1fr] sm:items-end">
        <div>
          <label htmlFor={`${id}-qty`} className="label">
            Quantity
          </label>
          <QuantityInput
            id={`${id}-qty`}
            label={`quantity of ${item.name}`}
            value={quantity}
            onChange={setQuantity}
            onCommit={(value) => updateRequirement(item.id, { quantity: value })}
          />
        </div>
        <div>
          <label htmlFor={`${id}-unit`} className="label">
            Unit
          </label>
          <select
            id={`${id}-unit`}
            value={item.unit}
            onChange={(event) => updateRequirement(item.id, { unit: event.target.value })}
            className="field"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <div className="flex h-12 items-center gap-5 sm:justify-end">
          {!showNotes && (
            <button type="button" onClick={() => setShowNotes(true)} className="link text-body">
              Add a note
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              removeRequirement(item.id);
              announce(`${item.name} removed from your requirements.`);
            }}
            className="inline-flex items-center gap-1.5 text-body text-muted transition-colors hover:text-danger"
          >
            <Trash className="size-4" aria-hidden="true" />
            Remove<span className="sr-only"> {item.name}</span>
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="col-span-2 sm:col-span-1 sm:col-start-2">
          <label htmlFor={`${id}-notes`} className="label">
            Notes for this product <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={`${id}-notes`}
            defaultValue={item.notes}
            onChange={(event) => updateRequirement(item.id, { notes: event.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Size, finish, colour or where it will be used"
            className="field min-h-[72px]"
          />
        </div>
      )}
    </li>
  );
}

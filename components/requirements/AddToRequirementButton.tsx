"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ProductRef } from "@/types/catalog";
import { announce } from "@/lib/announce";
import { routes } from "@/lib/routes";
import { saveRequirement, useHydrated, useRequirement } from "@/lib/requirements-store";

/**
 * Quick add from a product card: one of the product's default unit.
 * Once added it becomes a link to the list, where the quantity can be changed.
 */
export function AddToRequirementButton({ product }: { product: ProductRef }) {
  const hydrated = useHydrated();
  const inList = useRequirement(product.id);

  if (hydrated && inList) {
    return (
      <Link
        href={routes.requirements}
        className="btn btn-secondary btn-sm relative z-[2] w-full border-line-strong text-small"
      >
        <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <span>
          Added<span className="sr-only">: {product.name}.</span> · View list
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        saveRequirement(product, { quantity: 1, unit: product.units[0] ?? "Pieces" });
        announce(`${product.name} added to your requirements.`);
      }}
      className="btn btn-secondary btn-sm relative z-[2] w-full text-small"
    >
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      <span>
        Add to requirement<span className="sr-only">: {product.name}</span>
      </span>
    </button>
  );
}

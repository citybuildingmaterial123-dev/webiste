"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { routes } from "@/lib/routes";
import { clearRequirements, useHydrated, useRequirements } from "@/lib/requirements-store";
import { QuoteForm } from "./QuoteForm";
import { RequirementRow } from "./RequirementRow";

export function RequirementsView() {
  const hydrated = useHydrated();
  const items = useRequirements();
  const [confirmClear, setConfirmClear] = useState(false);

  // Arriving at /requirements/#quote: the form moves once the list has loaded, so scroll to it again.
  useEffect(() => {
    if (hydrated && window.location.hash === "#quote") {
      document.getElementById("quote")?.scrollIntoView({ block: "start" });
    }
  }, [hydrated]);

  // The list lives in this browser, so the static page shows a skeleton until it is read.
  if (!hydrated) return <RequirementsSkeleton />;

  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-6">
      <section aria-labelledby="list-title" className="lg:col-span-7">
        <div className="flex items-end justify-between gap-4 border-b border-ink pb-3">
          <h2 id="list-title" className="text-name-sm font-medium sm:text-name">
            {items.length === 0 ? "No products yet" : items.length === 1 ? "1 product" : `${items.length} products`}
          </h2>
          {items.length > 0 &&
            (confirmClear ? (
              <span className="flex items-center gap-4 text-body">
                <button
                  type="button"
                  className="link text-danger"
                  onClick={() => {
                    clearRequirements();
                    setConfirmClear(false);
                  }}
                >
                  Yes, clear the list
                </button>
                <button type="button" className="link" onClick={() => setConfirmClear(false)}>
                  Keep it
                </button>
              </span>
            ) : (
              <button type="button" className="link text-body text-muted" onClick={() => setConfirmClear(true)}>
                Clear list
              </button>
            ))}
        </div>

        {items.length === 0 ? (
          <div className="py-12">
            <ClipboardList className="size-10 text-muted" strokeWidth={1.25} aria-hidden="true" />
            <p className="mt-4 max-w-[46ch] text-lead-sm sm:text-lead">
              Browse the catalogue and add the products you need. Your list is saved on this device.
            </p>
            <Link href={routes.products} className="btn btn-secondary mt-6">
              See all products
            </Link>
          </div>
        ) : (
          <>
            <ul>
              {items.map((item, index) => (
                <RequirementRow key={item.id} item={item} index={index} />
              ))}
            </ul>
            <p className="mt-6 text-body text-muted">
              Need something else?{" "}
              <Link href={routes.products} className="link text-ink">
                Add more products
              </Link>
            </p>
          </>
        )}
      </section>

      <div id="quote" className="scroll-mt-24 lg:sticky lg:top-[calc(var(--nav)+24px)] lg:col-span-5">
        <QuoteForm items={items} />
      </div>
    </div>
  );
}

function RequirementsSkeleton() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-6" aria-busy="true" aria-label="Loading your requirements">
      <div className="lg:col-span-7">
        <div className="h-9 border-b border-ink" />
        {[0, 1].map((n) => (
          <div key={n} className="flex gap-6 border-b border-line py-6">
            <div className="size-16 animate-pulse bg-surface sm:size-[88px]" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-1/3 animate-pulse bg-surface" />
              <div className="h-4 w-2/3 animate-pulse bg-surface" />
              <div className="h-12 w-full max-w-[380px] animate-pulse bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div id="quote" className="h-[520px] animate-pulse border border-line bg-paper lg:col-span-5" />
    </div>
  );
}

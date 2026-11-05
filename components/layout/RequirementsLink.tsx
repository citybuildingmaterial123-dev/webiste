"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { routes } from "@/lib/routes";
import { useAddedPulse, useRequirements } from "@/lib/requirements-store";

/** "My requirements" with the number of products in the list. */
export function RequirementsLink({ variant }: { variant: "full" | "icon" }) {
  const count = useRequirements().length;
  const pulse = useAddedPulse();
  const pathname = usePathname();
  const current = pathname.startsWith(routes.requirements);
  const label = count === 1 ? "My requirements, 1 product" : `My requirements, ${count} products`;

  const badge = (
    <span
      // A new key replays the pulse animation each time a product is added.
      key={pulse}
      className={`inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-label font-medium tabular ${
        count > 0 ? "bg-ink text-inv-ink" : "bg-surface text-muted"
      } ${pulse ? "badge-bump" : ""}`}
      aria-hidden="true"
    >
      {count}
    </span>
  );

  if (variant === "icon") {
    return (
      <Link
        href={routes.requirements}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        className="relative flex size-11 items-center justify-center text-ink"
      >
        <ClipboardList className="size-6" strokeWidth={1.5} aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5">{badge}</span>
      </Link>
    );
  }

  return (
    <Link
      href={routes.requirements}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className="nav-link flex items-center gap-2 text-[15px] font-medium whitespace-nowrap text-ink"
    >
      <span>My requirements</span>
      {badge}
    </Link>
  );
}

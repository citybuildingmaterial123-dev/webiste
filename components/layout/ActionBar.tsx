"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import { useRequirements } from "@/lib/requirements-store";

/**
 * Phone action bar (under 640px): WhatsApp and the main action, always in reach.
 * Hidden on the requirements page, where the enquiry form is the action.
 */
export function ActionBar({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const count = useRequirements().length;
  if (pathname.startsWith(routes.requirements)) return null;

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ground sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="wrap grid h-16 grid-cols-2 items-center gap-3">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary px-3">
          <WhatsAppIcon />
          WhatsApp
        </a>
        <Link href={routes.quoteForm} className="btn btn-primary px-3">
          Request a quote
          {count > 0 && (
            <>
              <span className="rounded-full bg-on-accent/20 px-1.5 text-label tabular" aria-hidden="true">
                {count}
              </span>
              <span className="sr-only">, {count === 1 ? "1 product" : `${count} products`} in your list</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}

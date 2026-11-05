"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import { useRequirements } from "@/lib/requirements-store";
import { NAV_ITEMS, isCurrent } from "./nav-items";

interface MobileMenuProps {
  categories: { name: string; href: string }[];
  addressLines: string[];
  hours: { label: string; value: string }[];
  phone: string;
  phoneHref: string;
  whatsappHref: string;
}

/** Full-screen menu below 1024px. Closes on any link tap, on Escape and on navigation. */
export function MobileMenu({ categories, addressLines, hours, phone, phoneHref, whatsappHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const pathname = usePathname();
  const count = useRequirements().length;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close after a client-side navigation (state derived from the path it was opened on).
  const isOpen = open && openedOn === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      // Keep keyboard focus inside the menu.
      if (event.key === "Tab" && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a, button")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          buttonRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          buttonRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const toggle = () => {
    setOpenedOn(pathname);
    setOpen((value) => !(value && openedOn === pathname));
  };
  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="btn btn-secondary size-11 min-h-11 p-0 lg:hidden"
      >
        {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!isOpen}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-line bg-ground lg:hidden"
        style={{ top: "var(--nav)" }}
      >
        <nav aria-label="Menu" className="wrap pt-2 pb-10">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className="flex h-14 items-center text-lead-sm aria-[current=page]:font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-b border-line">
              <Link
                href={routes.requirements}
                onClick={close}
                className="flex h-14 items-center justify-between text-lead-sm"
              >
                My requirements
                <span className="text-small text-muted tabular">
                  {count === 1 ? "1 product" : `${count} products`}
                </span>
              </Link>
            </li>
          </ul>

          <p className="mt-8 mb-2 text-label font-medium text-muted">Product categories</p>
          <ul className="grid grid-cols-2 gap-x-3">
            {categories.map((category) => (
              <li key={category.href}>
                <Link href={category.href} onClick={close} className="flex min-h-11 items-center py-1 leading-snug">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 border-t border-line pt-6">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
              <WhatsAppIcon />
              Chat with us on WhatsApp
            </a>
            <a href={phoneHref} className="btn btn-secondary w-full">
              Call {phone}
            </a>
          </div>

          <div className="mt-8 grid gap-1 text-body text-muted">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <dl className="mt-3 grid gap-1">
              {hours.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt>{row.label}</dt>
                  <dd className="tabular text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </nav>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isCurrent } from "./nav-items";

export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-7 xl:gap-8">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className={item.href === "/" ? "hidden xl:block" : undefined}>
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="nav-link text-[15px] font-medium whitespace-nowrap text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

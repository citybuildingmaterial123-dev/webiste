import Link from "next/link";
import type { Category } from "@/types/catalog";
import { routes } from "@/lib/routes";

/** Subcategory links (real pages, so each has its own URL and search listing). */
export function SubcategoryNav({ category, activeSlug }: { category: Category; activeSlug?: string }) {
  const items = [
    { href: routes.category(category.slug), label: "All", count: category.productCount, active: !activeSlug },
    ...category.subcategories.map((sub) => ({
      href: routes.subcategory(category.slug, sub.slug),
      label: sub.name,
      count: sub.productCount,
      active: sub.slug === activeSlug,
    })),
  ];

  return (
    <nav aria-label={`${category.name} subcategories`}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-[2px] border px-4 text-body transition-colors ${
                item.active
                  ? "border-ink bg-ink text-inv-ink"
                  : "border-line-strong bg-transparent text-ink hover:border-ink hover:bg-ink/5"
              }`}
            >
              {item.label}
              <span className={`text-label tabular ${item.active ? "text-inv-muted" : "text-muted"}`}>{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

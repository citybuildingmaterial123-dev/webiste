import { routes } from "@/lib/routes";

export const NAV_ITEMS = [
  { label: "Home", href: routes.home },
  { label: "Products", href: routes.products },
  { label: "About us", href: routes.about },
  { label: "Contact us", href: routes.contact },
] as const;

/** Marks a nav word as current for its page and the pages under it. */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === routes.products) return pathname.startsWith("/products") || pathname.startsWith("/product/");
  return pathname.startsWith(href.replace(/\/$/, ""));
}

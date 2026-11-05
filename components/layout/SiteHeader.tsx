import Link from "next/link";
import { siteConfig } from "@/config/site";
import { addressLines, formatHours, phoneHref, whatsappUrl } from "@/lib/business";
import { getCategories } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { HeaderNav } from "./HeaderNav";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { RequirementsLink } from "./RequirementsLink";

/** Fixed, opaque header with a hairline; looks the same at every scroll position. */
export function SiteHeader() {
  const categories = getCategories().map((category) => ({
    name: category.name,
    href: routes.category(category.slug),
  }));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ground" style={{ height: "var(--nav)" }}>
      <a
        href="#main"
        className="absolute top-2 left-2 z-10 h-px w-px overflow-hidden bg-paper px-3 py-2 [clip-path:inset(50%)] focus:h-auto focus:w-auto focus:[clip-path:none]"
      >
        Skip to content
      </a>
      <div className="wrap flex h-full items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-6 xl:gap-10">
          <HeaderNav />
          <div className="hidden xl:block">
            <RequirementsLink variant="full" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="xl:hidden">
              <RequirementsLink variant="icon" />
            </div>
            <Link href={routes.quoteForm} className="btn btn-primary hidden whitespace-nowrap sm:inline-flex">
              Request a quote
            </Link>
            <MobileMenu
              categories={categories}
              addressLines={addressLines()}
              hours={siteConfig.hours.map((rule) => ({ label: rule.label, value: formatHours(rule) }))}
              phone={siteConfig.contact.phone}
              phoneHref={phoneHref()}
              whatsappHref={whatsappUrl()}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

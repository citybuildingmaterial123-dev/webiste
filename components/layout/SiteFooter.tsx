import Link from "next/link";
import { siteConfig } from "@/config/site";
import { photoSourcesLine } from "@/data/photos";
import { addressLines, formatHours, mapsUrl, phoneHref, whatsappUrl } from "@/lib/business";
import { getCategories } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { LogoMark } from "./Logo";
import { NAV_ITEMS } from "./nav-items";

export function SiteFooter() {
  const categories = getCategories();
  const creditsLine = photoSourcesLine();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-inv text-inv-ink" style={{ paddingBottom: "var(--bar)" }}>
      <div className="wrap grid gap-12 pt-16 pb-12 sm:grid-cols-2 sm:pt-20 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-inv-ink">
            <LogoMark className="size-7" />
            <span className="text-[20px] leading-none font-medium tracking-[-0.01em]">{siteConfig.name}</span>
          </Link>
          <p className="mt-5 max-w-[34ch] text-body text-inv-muted">{siteConfig.brandLine}</p>
          <p className="mt-3 max-w-[40ch] text-body text-inv-muted">
            Hardware, electricals, plywood, roofing, steel, pipes, cladding and doors for homes, contractors and
            projects.
          </p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-2">
          <h2 className="text-label font-medium text-inv-muted">Quick links</h2>
          <ul className="mt-4 grid gap-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={routes.requirements} className="nav-link">
                My requirements
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Product categories" className="lg:col-span-3">
          <h2 className="text-label font-medium text-inv-muted">Product categories</h2>
          <ul className="mt-4 grid gap-2.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={routes.category(category.slug)} className="nav-link">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-label font-medium text-inv-muted">Visit or contact</h2>
          <address className="mt-4 grid gap-1 not-italic">
            <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="link w-fit">
              {addressLines().join(", ")}
            </a>
          </address>
          <dl className="mt-4 grid gap-2">
            {siteConfig.hours.map((rule) => (
              <div key={rule.label}>
                <dt className="text-inv-muted">{rule.label}</dt>
                <dd className="tabular">{formatHours(rule)}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-5 grid gap-2.5">
            <li>
              <a href={phoneHref()} className="nav-link tabular">
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex items-center gap-2"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            </li>
            {siteConfig.contact.email && (
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="nav-link">
                  {siteConfig.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-inv-surface py-6 text-small text-inv-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {siteConfig.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href={routes.privacy} className="nav-link">
              Privacy
            </Link>
          </li>
          {creditsLine && (
            <li>
              <Link href={routes.credits} className="nav-link">
                {creditsLine}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CloseBand } from "@/components/layout/CloseBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Photo } from "@/components/ui/Photo";
import { photos } from "@/data/photos";
import { placeName } from "@/lib/business";
import { getActiveCategories } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { locationSuffix, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description: `${siteConfig.name} supplies building materials${locationSuffix()} to homeowners, contractors, builders, architects, interior designers and fabricators.`,
  path: routes.about,
});

const CUSTOMERS = [
  { title: "Homeowners", text: "Building or renovating a house, one room or a whole floor." },
  { title: "Contractors and builders", text: "Complete material lists for sites, quoted together in one reply." },
  { title: "Architects and interior designers", text: "Specified grades, finishes and brands for client projects." },
  { title: "Fabricators", text: "Pipes, sheets, stainless steel and weldmesh for fabrication work." },
];

export default function AboutPage() {
  const categories = getActiveCategories();
  const photo = photos.plywood;
  const { establishedYear, paragraphs } = siteConfig.about;

  return (
    <>
      <div className="page-pad">
        <div className="wrap">
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "About us", path: routes.about },
            ]}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-6">
              <h1 className="text-h1-sm sm:text-h1">
                About {siteConfig.name}
              </h1>
              <p className="mt-4 text-lead-sm text-muted sm:text-lead">
                A building materials store in {placeName()}
                {establishedYear ? `, serving customers since ${establishedYear}` : ""}.
              </p>
              <div className="mt-8 grid max-w-[60ch] gap-4 text-body">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            {photo && (
              <div className="lg:col-span-6">
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  <Photo image={photo} alt={photo.alt} sizes="(min-width: 1280px) 588px, (min-width: 1024px) 45vw, 100vw" priority className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <section aria-labelledby="customers-title" className="mt-24">
            <h2 id="customers-title" className="text-h2-sm sm:text-h2">
              Who we work with
            </h2>
            <ul className="mt-10 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
              {CUSTOMERS.map((customer) => (
                <li key={customer.title} className="border-t border-ink py-5">
                  <h3 className="text-name-sm sm:text-name">{customer.title}</h3>
                  <p className="mt-2 text-body text-muted">{customer.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="range-title" className="mt-24 grid gap-8 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h2 id="range-title" className="text-h2-sm sm:text-h2">
                What we stock
              </h2>
              <p className="mt-3 text-body text-muted">
                {categories.length} product ranges. Ask us for anything you cannot find in the catalogue.
              </p>
            </div>
            <ul className="lg:col-span-7">
              {categories.map((category) => (
                <li key={category.slug} className="border-b border-line first:border-t">
                  <Link
                    href={routes.category(category.slug)}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span>
                      <span className="nav-link text-body font-medium">{category.name}</span>
                      <span className="mt-0.5 block text-body text-muted">{category.description}</span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <CloseBand />
    </>
  );
}

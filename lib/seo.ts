import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { addressLines, SCHEMA_DAYS } from "./business";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url + "/").toString();
}

/** " in Chennai" when a city is configured, otherwise "". */
export function locationSuffix(): string {
  return siteConfig.address.city ? ` in ${siteConfig.address.city}` : "";
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  /** Use `title` as the full title instead of "<title> | <store>". */
  absoluteTitle?: boolean;
}

/** Title, description, canonical URL and Open Graph / Twitter tags for a page. */
export function pageMetadata({ title, description, path, image, noIndex, absoluteTitle }: PageMetadataInput): Metadata {
  const ogImage = image ?? siteConfig.seo.ogImage;
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.seo.locale,
      title: fullTitle,
      description,
      url: path,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD)
// ---------------------------------------------------------------------------

export function localBusinessJsonLd() {
  const { address, contact } = siteConfig;
  const sameAs = Object.values(siteConfig.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": absoluteUrl("/#store"),
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(siteConfig.seo.ogImage),
    telephone: contact.phone,
    ...(contact.email ? { email: contact.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: addressLines()[0],
      addressLocality: address.city || address.area,
      ...(address.state ? { addressRegion: address.state } : {}),
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.countryCode,
    },
    openingHoursSpecification: siteConfig.hours
      .filter((rule) => rule.opens && rule.closes)
      .map((rule) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: rule.days.map((d) => `https://schema.org/${SCHEMA_DAYS[d]}`),
        opens: rule.opens,
        closes: rule.closes,
      })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

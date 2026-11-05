import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/Hero";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { TrustSection } from "@/components/home/TrustSection";
import { VisitSection } from "@/components/home/VisitSection";
import { CloseBand } from "@/components/layout/CloseBand";
import { placeName } from "@/lib/business";
import { locationSuffix, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name}: building materials store in ${placeName()}`,
  absoluteTitle: true,
  description: `Hardware, electricals, plywood, roofing sheets, stainless steel, MS and GI pipes, cladding sheets and doors${locationSuffix()}. Add products to your list and request a quotation on WhatsApp.`,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <QuoteSteps />
      <TrustSection />
      <VisitSection />
      <CloseBand />
    </>
  );
}

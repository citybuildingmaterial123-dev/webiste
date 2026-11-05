import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { VisitSection } from "@/components/home/VisitSection";
import { CloseBand } from "@/components/layout/CloseBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { addressOneLine, hoursSummary } from "@/lib/business";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: `Visit ${siteConfig.name} at ${addressOneLine()}. ${hoursSummary()}. Call us or chat on WhatsApp for prices and availability.`,
  path: routes.contact,
});

export default function ContactPage() {
  return (
    <>
      <div className="wrap pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "Contact us", path: routes.contact },
          ]}
        />
      </div>
      <VisitSection headingLevel={1} />
      <CloseBand />
    </>
  );
}

import type { Metadata } from "next";
import { RequirementsView } from "@/components/requirements/RequirementsView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "My requirements",
  description: "Your list of building materials. Set quantities and send the list to our team on WhatsApp for a quotation.",
  path: routes.requirements,
  noIndex: true,
});

export default function RequirementsPage() {
  return (
    <div className="page-pad">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "My requirements", path: routes.requirements },
          ]}
        />
        <h1 className="mt-8 text-h1-sm sm:text-h1">My requirements</h1>
        <p className="mt-4 max-w-[56ch] text-lead-sm text-muted sm:text-lead">
          Check the quantities, add notes where needed, then send the list to us on WhatsApp. We reply with prices
          and availability.
        </p>
        <RequirementsView />
      </div>
    </div>
  );
}

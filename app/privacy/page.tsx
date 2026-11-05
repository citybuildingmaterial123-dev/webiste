import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: `How ${siteConfig.name}'s website handles your requirement list and enquiry details.`,
  path: routes.privacy,
});

export default function PrivacyPage() {
  return (
    <div className="page-pad">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "Privacy", path: routes.privacy },
          ]}
        />
        <div className="mt-8 max-w-[62ch]">
          <h1 className="text-h1-sm sm:text-h1">Privacy</h1>
          <div className="mt-8 grid gap-5 text-body">
            <p>
              This website has no accounts, no online payments and no contact database. It does not send the details
              you type to {siteConfig.name} or to anyone else.
            </p>
            <h2 className="mt-4 text-name-sm sm:text-name">Your requirement list</h2>
            <p>
              The products, quantities and notes you add are saved in your own browser (local storage), so the list is
              still there when you come back. You can remove items or clear the list at any time on the My
              requirements page. Clearing your browser data also removes it.
            </p>
            <h2 className="mt-4 text-name-sm sm:text-name">Enquiries on WhatsApp</h2>
            <p>
              When you request a quote, the website prepares a WhatsApp message with your list and the details you
              entered, and opens WhatsApp. Nothing is shared until you press send in WhatsApp. Your name, phone
              number and location are remembered on this device to save typing next time.
            </p>
            <p>
              Messages you send on WhatsApp are handled under WhatsApp&apos;s own terms and privacy policy. We use your
              details only to reply to your enquiry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

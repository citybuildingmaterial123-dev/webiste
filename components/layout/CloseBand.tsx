import Link from "next/link";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/business";
import { routes } from "@/lib/routes";
import { buildHelpMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/Icons";

/**
 * The closing band above the footer, on the same dark ground: project enquiries
 * on the left, help choosing materials on the right.
 */
export function CloseBand() {
  return (
    <section aria-labelledby="close-title" className="bg-inv text-inv-ink">
      <div className="wrap grid gap-12 border-b border-inv-surface pt-20 pb-16 sm:pt-24 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          <h2 id="close-title" className="text-h2-sm sm:text-h2">
            Material lists for homes and projects
          </h2>
          <p className="mt-4 max-w-[52ch] text-lead-sm text-inv-muted sm:text-lead">
            Building a new home or working on a commercial project? Send us your complete material list and our team
            will prepare a quotation with prices and availability.
          </p>
          <Link href={routes.requirements} className="btn btn-primary mt-8 w-full sm:w-auto">
            Send your requirements
          </Link>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h3 className="text-name-sm sm:text-name">Help choosing materials</h3>
          <p className="mt-3 max-w-[46ch] text-body text-inv-muted">
            Not sure which grade, size or brand is right for your work? Our team can help you choose the right
            products for your requirements.
          </p>
          <a
            href={whatsappUrl(buildHelpMessage(siteConfig.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary-inv mt-6 w-full sm:w-auto"
          >
            <WhatsAppIcon />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

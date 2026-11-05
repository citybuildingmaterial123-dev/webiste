import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { OpenStatus } from "@/components/layout/OpenStatus";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { addressLines, formatHours, mapsUrl, phoneHref, whatsappUrl } from "@/lib/business";

/** Address set large (the page's one type moment), then address, hours and contact in three columns. */
export function VisitSection({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const [street, ...rest] = addressLines();

  return (
    <section id="visit" aria-labelledby="visit-title" className={headingLevel === 1 ? "page-pad" : "section-pad"}>
      <div className="wrap">
        <Heading id="visit-title" className={headingLevel === 1 ? "text-h1-sm sm:text-h1" : "text-h2-sm sm:text-h2"}>
          Visit the store
        </Heading>
        <p className="mt-6 text-moment">
          <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="link">
            {street}
          </a>
        </p>

        <div className="mt-12 grid gap-10 border-t border-ink pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <div>
            <h3 className="text-label font-medium text-muted">Address</h3>
            <address className="mt-3 text-lead-sm not-italic sm:text-lead">
              {[street, ...rest].map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={mapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="link mt-4 inline-flex items-center gap-1 text-body font-medium"
            >
              Get directions on Google Maps
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div>
            <h3 className="text-label font-medium text-muted">Opening hours</h3>
            <dl className="mt-3 grid gap-1.5 text-body">
              {siteConfig.hours.map((rule) => (
                <div key={rule.label} className="flex justify-between gap-6 border-b border-line pb-1.5">
                  <dt>{rule.label}</dt>
                  <dd className="tabular">{formatHours(rule)}</dd>
                </div>
              ))}
            </dl>
            <OpenStatus className="mt-3 text-body text-muted" />
          </div>

          <div>
            <h3 className="text-label font-medium text-muted">Talk to our team</h3>
            <p className="mt-3 text-lead-sm sm:text-lead">
              <a href={phoneHref()} className="link tabular">
                {siteConfig.contact.phone}
              </a>
            </p>
            {siteConfig.contact.email && (
              <p className="mt-1 text-body">
                <a href={`mailto:${siteConfig.contact.email}`} className="link">
                  {siteConfig.contact.email}
                </a>
              </p>
            )}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary mt-5 w-full sm:w-auto"
            >
              <WhatsAppIcon />
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

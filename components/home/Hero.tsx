import Link from "next/link";
import { siteConfig } from "@/config/site";
import { photos } from "@/data/photos";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { hoursSummary, placeName, whatsappUrl } from "@/lib/business";
import { routes } from "@/lib/routes";
import { buildHelpMessage } from "@/lib/whatsapp";

/**
 * Shop hero: one full-bleed photograph with nothing on it, the words on the
 * ground below. What is sold and where, one hard fact (the hours), two actions.
 */
export function Hero() {
  const photo = photos.hero;
  return (
    <section
      aria-labelledby="hero-title"
      className={`flex flex-col pb-[calc(24px+var(--bar))] sm:pb-16 ${photo ? "min-h-[calc(100svh-var(--nav))]" : "pt-10 sm:pt-16"}`}
    >
      {photo && (
        <div className="h-[clamp(190px,30svh,260px)] w-full overflow-hidden bg-surface sm:h-[clamp(260px,46svh,480px)]">
          <Photo image={photo} sizes="100vw" priority className="h-full w-full object-cover" />
        </div>
      )}
      <div className="wrap mt-6 grid gap-5 sm:mt-10 lg:grid-cols-12 lg:gap-6">
        <h1 id="hero-title" className="text-h1-sm sm:text-h1 lg:col-span-6">
          Building materials store in {placeName()}
        </h1>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="max-w-[46ch] text-lead-sm sm:text-lead">
            Hardware, electricals, plywood, roofing sheets, stainless steel, pipes, cladding and doors for homes,
            contractors and projects.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={routes.quoteForm} className="btn btn-primary">
              Request a quote
            </Link>
            <Link href={routes.products} className="btn btn-secondary">
              See all products
            </Link>
          </div>
          <p className="mt-5 text-small text-muted">
            {hoursSummary()}.{" "}
            <a
              href={whatsappUrl(buildHelpMessage(siteConfig.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="link inline-flex items-center gap-1.5 font-medium text-ink"
            >
              <WhatsAppIcon className="size-4 self-center" />
              Chat with us on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

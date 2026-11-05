import type { SiteConfig } from "@/config/site";

/**
 * Lists business settings that still hold placeholder values, so a build
 * can warn before the site goes live with them.
 */
export function getConfigWarnings(config: SiteConfig, env: NodeJS.ProcessEnv = process.env): string[] {
  const warnings: string[] = [];
  const digits = config.contact.whatsappNumber.replace(/\D/g, "");

  if (/^9?1?0+$/.test(digits)) {
    warnings.push("WhatsApp number is a placeholder: set NEXT_PUBLIC_WHATSAPP_NUMBER (country code + number).");
  } else if (digits.length < 8 || digits.length > 15 || digits !== config.contact.whatsappNumber) {
    warnings.push(
      `WhatsApp number "${config.contact.whatsappNumber}" should be digits only with country code, e.g. 919876543210.`,
    );
  }
  if (/0{5}/.test(config.contact.phone)) warnings.push("Phone number is a placeholder (config/site.ts or NEXT_PUBLIC_PHONE_NUMBER).");
  if (config.name === "City Building Materials") warnings.push("Store name is the placeholder in config/site.ts.");
  if (config.address.street === "Main Road" && config.address.area === "Town Centre") {
    warnings.push("Store address is a placeholder (config/site.ts > address).");
  }
  if (!config.address.city) warnings.push("City is empty (config/site.ts > address.city); page titles will not mention it.");
  if (!config.mapsUrl) warnings.push("Google Maps link is empty (config/site.ts > mapsUrl); an address search link is used.");
  if (!env.NEXT_PUBLIC_SITE_URL) warnings.push("NEXT_PUBLIC_SITE_URL is not set; canonical URLs and the sitemap use localhost.");
  return warnings;
}

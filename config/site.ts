/**
 * ============================================================================
 *  BUSINESS SETTINGS: edit this file to make the website yours.
 * ============================================================================
 *
 * Every value marked `PLACEHOLDER` must be replaced before going live.
 * `npm run build` prints a warning for each placeholder that is still in use.
 *
 * Secrets never go in this file. The WhatsApp number, phone number and site URL
 * can also come from environment variables (see `.env.example`), which override
 * the values below.
 */

export interface OpeningHoursRule {
  /** Shown on the site, e.g. "Monday to Saturday". */
  label: string;
  /** 0 = Sunday ... 6 = Saturday */
  days: readonly number[];
  /** 24-hour "HH:MM". Omit both for a closed day. */
  opens?: string;
  closes?: string;
}

/** PLACEHOLDER: opening hours (shown on the site and sent to search engines). */
const openingHours: readonly OpeningHoursRule[] = [
  { label: "Monday to Saturday", days: [1, 2, 3, 4, 5, 6], opens: "09:30", closes: "20:30" },
  { label: "Sunday", days: [0] },
];

export const siteConfig = {
  // --------------------------------------------------------------------------
  // Identity
  // --------------------------------------------------------------------------
  /** PLACEHOLDER: the store's trading name. */
  name: "City Building Materials",
  /** Used in the footer and share previews. Plain words, no slogans. */
  description:
    "Hardware, electricals, plywood, roofing sheets, stainless steel, MS and GI pipes, cladding sheets and doors for homes, contractors and projects. Send your list and get a quotation on WhatsApp.",
  /** The one brand line on the site (shown in the footer). */
  brandLine: "Everything you need to build better.",
  /**
   * PLACEHOLDER (optional): path to your logo in /public, e.g. "/logo.svg".
   * Leave null to use the built-in mark with the store name.
   */
  logo: null as string | null,

  /** Full public URL, no trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),

  // --------------------------------------------------------------------------
  // Contact
  // --------------------------------------------------------------------------
  contact: {
    /**
     * PLACEHOLDER: WhatsApp number for enquiries, digits only, with country code.
     * Prefer setting NEXT_PUBLIC_WHATSAPP_NUMBER. The zeros below cannot reach anyone.
     */
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "910000000000",
    /** PLACEHOLDER: phone number exactly as it should be displayed. */
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91 00000 00000",
    /** Optional public email address. Leave empty to hide it. */
    email: "",
  },

  // --------------------------------------------------------------------------
  // Location
  // --------------------------------------------------------------------------
  address: {
    /** PLACEHOLDER: building / street line. */
    street: "Main Road",
    /** PLACEHOLDER: area, locality or district. */
    area: "Town Centre",
    /** PLACEHOLDER: city. Also used in page titles for local search once set. */
    city: "",
    /** PLACEHOLDER */
    state: "",
    /** PLACEHOLDER */
    postalCode: "",
    country: "India",
    countryCode: "IN",
  },
  /**
   * PLACEHOLDER: link to the store on Google Maps (Share > Copy link).
   * Leave empty to build a search link from the address above.
   */
  mapsUrl: "",

  /** IANA time zone used for the "Open now" line. */
  timeZone: "Asia/Kolkata",
  hours: openingHours,

  // --------------------------------------------------------------------------
  // Search engines
  // --------------------------------------------------------------------------
  seo: {
    /** Language/region of the site content. */
    locale: "en_IN",
    /** Default share image (1200 x 630) in /public. */
    ogImage: "/og-image.jpg",
  },

  /** Social profiles (full URLs). Empty ones are hidden. */
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },

  // --------------------------------------------------------------------------
  // About page copy
  // --------------------------------------------------------------------------
  about: {
    /** PLACEHOLDER (optional): year the store opened, e.g. 1998. Shown only when set. */
    establishedYear: null as number | null,
    paragraphs: [
      "We supply building materials to homeowners, contractors, builders, architects, interior designers and fabricators. Hardware, electricals, plywood, roofing, stainless steel, pipes, cladding and doors are all available from one counter.",
      "Most customers send us their material list first. We check stock, suggest the right grade or size when needed, and reply with prices and availability, so you can plan your purchase before you visit.",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Site photographs (hero and category cards), resized to WebP in /public/images.
 *
 * These are openly licensed stand-in photographs of materials. Replace them with
 * the store's own photographs when available: keep the same file names and
 * widths, or update the entries below.
 */

export type PhotoKey =
  | "hero"
  | "hardware"
  | "electricals"
  | "plywood"
  | "roofing-sheets"
  | "stainless-steel"
  | "ms-gi-pipes"
  | "cladding-sheets"
  | "doors"
  | "project";

export interface PhotoCredit {
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export interface StockPhoto {
  /** Path without width suffix: `/images/plywood` -> `/images/plywood-800.webp`. */
  base: string;
  widths: number[];
  /** Intrinsic size of the largest file. */
  width: number;
  height: number;
  alt: string;
  /** CSS object-position used when the frame crops the photo. */
  position?: string;
  credit: PhotoCredit;
}

const CARD = [480, 800, 1200];

export const photos: Partial<Record<PhotoKey, StockPhoto>> = {
  hero: {
    base: "/images/hero",
    widths: [768, 1280, 1920, 2560],
    width: 2560,
    height: 1920,
    alt: "Ends of stacked pipes",
    position: "center",
    credit: {
      title: "A pile of pipes",
      author: "Neil Owen",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:A_pile_of_pipes_-_geograph.org.uk_-_7698763.jpg",
    },
  },
  hardware: {
    base: "/images/hardware",
    widths: CARD,
    width: 1200,
    height: 900,
    alt: "Cabinet handles and knobs on wooden drawer fronts",
    position: "left center",
    credit: {
      title: "Kitchen cabinet hardware 2009",
      author: "Tomwsulcer",
      license: "Public domain",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Kitchen_cabinet_hardware_2009.jpg",
    },
  },
  electricals: {
    base: "/images/electricals",
    widths: CARD,
    width: 1200,
    height: 900,
    alt: "Installation cable with blue, brown and earth wires",
    position: "center",
    credit: {
      title: "Installation Cable MMJ 3x2,5S",
      author: "Santeri Viinamäki",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Installation_Cable_MMJ_3x2,5S.jpg",
    },
  },
  plywood: {
    base: "/images/plywood",
    widths: CARD,
    width: 1200,
    height: 800,
    alt: "Layered edges of stacked plywood",
    position: "center",
    credit: {
      title: "plied",
      author: "timlewisnm",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://www.flickr.com/photos/10343926@N02/5588222832",
    },
  },
  "roofing-sheets": {
    base: "/images/roofing-sheets",
    widths: CARD,
    width: 1200,
    height: 800,
    alt: "Stack of red trapezoidal roofing sheets",
    position: "left center",
    credit: {
      title: "Nordblech18 Trapezblech 18-137",
      author: "Nordbleche",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nordblech18_Trapezblech_18-137.jpg",
    },
  },
  "stainless-steel": {
    base: "/images/stainless-steel",
    widths: CARD,
    width: 1200,
    height: 900,
    alt: "Stainless steel handrail beside stone steps",
    position: "center",
    credit: {
      title: "Stainless steel railing",
      author: "Editorq35",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Stainless_steel_railing.jpg",
    },
  },
  "ms-gi-pipes": {
    base: "/images/ms-gi-pipes",
    widths: CARD,
    width: 1200,
    height: 800,
    alt: "Steel pipes stacked in a yard",
    position: "center bottom",
    credit: {
      title: "Metal tubes stored in a yard",
      author: "Paul Goyette",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Metal_tubes_stored_in_a_yard.jpg",
    },
  },
  "cladding-sheets": {
    base: "/images/cladding-sheets",
    widths: CARD,
    width: 1200,
    height: 800,
    alt: "Building front clad in light grey panels",
    position: "right center",
    credit: {
      title: "Modern residential facade",
      author: "Samuel Zeller",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Modern_residential_facade_(Unsplash).jpg",
    },
  },
  doors: {
    base: "/images/doors",
    widths: CARD,
    width: 1200,
    height: 1807,
    alt: "Raised-panel wooden double door",
    position: "center",
    credit: {
      title: "Goa, India: traditional-style wooden door",
      author: "Frederick Noronha",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Goa,_India_--_Traditional-style_wooden_door.jpg",
    },
  },
  project: {
    base: "/images/project",
    widths: [640, 1000, 1400],
    width: 1400,
    height: 1009,
    alt: "House under construction with concrete columns and steel reinforcement",
    position: "center",
    credit: {
      title: "A building construction site (cropped)",
      author: "Makarand Mane",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      sourceUrl: "https://wordpress.org/photos/photo/650661ced0/",
    },
  },
};

/** "Photographs via Wikimedia Commons and Flickr": the one credits line in the footer. */
export function photoSourcesLine(): string | null {
  const names = new Set<string>();
  for (const photo of Object.values(photos)) {
    const host = new URL(photo.credit.sourceUrl).hostname.replace(/^www\./, "");
    if (host.endsWith("wikimedia.org")) names.add("Wikimedia Commons");
    else if (host.endsWith("flickr.com")) names.add("Flickr");
    else if (host === "wordpress.org") names.add("the WordPress Photo Directory");
    else names.add(host);
  }
  if (names.size === 0) return null;
  const list = [...names];
  const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0];
  return `Photographs via ${joined}`;
}

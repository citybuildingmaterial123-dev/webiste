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

export const photos: Partial<Record<PhotoKey, StockPhoto>> = {};

/** "Photographs via Wikimedia Commons and Flickr": the one credits line in the footer. */
export function photoSourcesLine(): string | null {
  const names = new Set<string>();
  for (const photo of Object.values(photos)) {
    const host = new URL(photo.credit.sourceUrl).hostname.replace(/^www\./, "");
    if (host.endsWith("wikimedia.org")) names.add("Wikimedia Commons");
    else if (host.endsWith("flickr.com")) names.add("Flickr");
    else names.add(host);
  }
  if (names.size === 0) return null;
  const list = [...names];
  const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : list[0];
  return `Photographs via ${joined}`;
}

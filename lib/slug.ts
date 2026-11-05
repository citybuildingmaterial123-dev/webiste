/** URL-safe slug: "BWP Plywood 18mm (8x4)" -> "bwp-plywood-18mm-8x4". */
export function slugify(input: string, maxLength = 80): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, maxLength).replace(/-+$/g, "");
}

/**
 * Loose comparison key for matching sheet values against the taxonomy:
 * "Wires & Cables", "wires and cables" and "WIRES-AND-CABLES" all match.
 */
export function matchKey(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

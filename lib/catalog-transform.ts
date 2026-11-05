/**
 * Turns raw sheet rows into validated catalogue data.
 * Pure functions only (no network, no file system) so they are easy to test.
 */
import type { Category, CategoryImage, Product, SpecRow, Subcategory } from "@/types/catalog";
import type { CategoryDefinition } from "@/data/taxonomy";
import { DEFAULT_UNITS } from "@/data/taxonomy";
import type { PhotoKey, StockPhoto } from "@/data/photos";
import { matchKey, slugify } from "./slug";
import { parseUnitList } from "./units";

export class CatalogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogValidationError";
  }
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

type KnownField =
  | "id"
  | "category"
  | "subcategory"
  | "product_name"
  | "brand"
  | "description"
  | "image_url"
  | "specifications"
  | "status"
  | "units"
  | "featured"
  | "sort_order"
  | "tags"
  | "slug";

/** Accepted header spellings for each known column (after normaliseHeader). */
const FIELD_ALIASES: Record<KnownField, string[]> = {
  id: ["id", "sku", "code", "product_id", "item_code", "product_code"],
  category: ["category", "main_category", "category_name"],
  subcategory: ["subcategory", "sub_category", "subcategory_name", "sub_category_name"],
  product_name: ["product_name", "name", "product", "title", "item", "item_name", "product_title"],
  brand: ["brand", "make", "manufacturer", "company"],
  description: ["description", "details", "desc", "product_description"],
  image_url: ["image_url", "image", "image_link", "photo", "photo_url", "picture", "img", "image_urls"],
  specifications: ["specifications", "specs", "specification", "spec"],
  status: ["status", "visibility", "visible", "active", "publish", "published", "show"],
  units: ["units", "unit", "uom", "unit_of_measure"],
  featured: ["featured", "highlight", "popular"],
  sort_order: ["sort_order", "order", "position", "sort", "display_order", "priority"],
  tags: ["tags", "keywords", "search_terms"],
  slug: ["slug", "url_slug"],
};

const ALIAS_LOOKUP = new Map<string, KnownField>(
  (Object.entries(FIELD_ALIASES) as [KnownField, string[]][]).flatMap(([field, aliases]) =>
    aliases.map((alias) => [alias, field] as const),
  ),
);

/** "Product Name " -> "product_name", "Sub-Category" -> "sub_category". */
export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** "thickness_mm" -> "Thickness mm" for extra columns shown as product details. */
function prettifyHeader(header: string): string {
  const text = header.trim().replace(/[_]+/g, " ").replace(/\s+/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------------------
// Cell parsers
// ---------------------------------------------------------------------------

const HIDDEN_STATUS = new Set([
  "inactive", "hidden", "hide", "draft", "no", "n", "false", "0", "archived",
  "discontinued", "disabled", "off", "unpublished", "deleted",
]);
const VISIBLE_STATUS = new Set([
  "", "active", "published", "publish", "yes", "y", "true", "1", "show", "visible",
  "live", "on", "available", "in stock", "instock", "new",
]);

export type Visibility = "visible" | "hidden" | "unknown";

export function parseVisibility(raw: string): Visibility {
  const value = raw.trim().toLowerCase();
  if (HIDDEN_STATUS.has(value)) return "hidden";
  if (VISIBLE_STATUS.has(value)) return "visible";
  return "unknown";
}

function parseBoolean(raw: string): boolean {
  return ["yes", "y", "true", "1", "featured", "x", "✓"].includes(raw.trim().toLowerCase());
}

/**
 * "Thickness: 18 mm | Size: 8 x 4 ft | Termite resistant"
 *   -> specs: [{Thickness, 18 mm}, {Size, 8 x 4 ft}], features: ["Termite resistant"]
 * Lines may be separated by new lines or "|". "=" also works instead of ":".
 */
export function parseSpecifications(raw: string): { specs: SpecRow[]; features: string[] } {
  const specs: SpecRow[] = [];
  const features: string[] = [];
  const parts = raw
    .split(/\r?\n|\|/)
    .map((part) => part.replace(/^[\s\-*•·]+/, "").trim())
    .filter(Boolean);

  for (const part of parts) {
    const match = /^([^:=]{1,40})[:=]\s*(.+)$/.exec(part);
    if (match) specs.push({ label: match[1].trim(), value: match[2].trim() });
    else features.push(part);
  }
  return { specs, features };
}

/**
 * Accepts direct image links, Google Drive share links, Dropbox links and
 * paths to files in /public. Returns null for anything unusable.
 */
export function normalizeImageUrl(raw: string): string | null {
  // A cell may hold several links; the first one is used.
  const value = raw.trim().split(/\s+|,(?=\s*https?:)/)[0]?.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  if (url.hostname === "drive.google.com" || url.hostname === "docs.google.com") {
    const id = /\/(?:file\/)?d\/([\w-]{10,})/.exec(url.pathname)?.[1] ?? url.searchParams.get("id");
    if (id) return `https://lh3.googleusercontent.com/d/${id}=w1600`;
  }
  if (url.hostname.endsWith("dropbox.com")) {
    url.searchParams.delete("dl");
    url.searchParams.set("raw", "1");
    return url.toString();
  }
  return url.toString();
}

/** First sentence, at most ~160 characters, cut on a word boundary. */
export function summarize(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentence = /^(.+?[.!?])(\s|$)/.exec(clean)?.[1] ?? clean;
  if (sentence.length <= maxLength) return sentence;
  const cut = sentence.slice(0, maxLength - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), maxLength * 0.6)).replace(/[,;:\s]+$/, "") + "…";
}

// ---------------------------------------------------------------------------
// Catalogue builder
// ---------------------------------------------------------------------------

interface CategoryBuilder {
  def: CategoryDefinition;
  subcategories: Map<string, { slug: string; name: string; description?: string }>;
  subLookup: Map<string, string>;
  fromSheet: boolean;
}

export interface BuildCatalogOptions {
  taxonomy: CategoryDefinition[];
  photos?: Partial<Record<PhotoKey, StockPhoto>>;
}

export interface BuildCatalogResult {
  categories: Category[];
  products: Product[];
  warnings: string[];
  hiddenCount: number;
}

export function buildCatalog(rows: string[][], options: BuildCatalogOptions): BuildCatalogResult {
  const warnings: string[] = [];
  const warnOnce = (() => {
    const seen = new Set<string>();
    return (message: string) => {
      if (!seen.has(message)) {
        seen.add(message);
        warnings.push(message);
      }
    };
  })();

  if (rows.length === 0) throw new CatalogValidationError("The sheet is empty.");

  // --- Header row -----------------------------------------------------------
  const header = rows[0];
  const fieldIndex: Partial<Record<KnownField, number>> = {};
  const extraColumns: { index: number; label: string }[] = [];

  header.forEach((rawHeader, index) => {
    const key = normalizeHeader(rawHeader);
    if (!key) return;
    const field = ALIAS_LOOKUP.get(key);
    if (!field) extraColumns.push({ index, label: prettifyHeader(rawHeader) });
    else if (fieldIndex[field] === undefined) fieldIndex[field] = index;
    else warnOnce(`Column "${rawHeader.trim()}" repeats the "${field}" column and was ignored.`);
  });

  for (const required of ["product_name", "category"] as const) {
    if (fieldIndex[required] === undefined) {
      throw new CatalogValidationError(
        `The sheet has no "${required}" column. Found columns: ${header.map((h) => `"${h.trim()}"`).join(", ")}.`,
      );
    }
  }

  // --- Taxonomy registry ----------------------------------------------------
  const builders = new Map<string, CategoryBuilder>();
  const categoryLookup = new Map<string, string>();

  const registerCategory = (def: CategoryDefinition, fromSheet: boolean) => {
    const builder: CategoryBuilder = { def, subcategories: new Map(), subLookup: new Map(), fromSheet };
    for (const sub of def.subcategories) {
      builder.subcategories.set(sub.slug, { slug: sub.slug, name: sub.name, description: sub.description });
      for (const key of [sub.slug, sub.name, ...(sub.aliases ?? [])]) builder.subLookup.set(matchKey(key), sub.slug);
    }
    builders.set(def.slug, builder);
    for (const key of [def.slug, def.name, ...def.aliases]) categoryLookup.set(matchKey(key), def.slug);
    return builder;
  };
  for (const def of options.taxonomy) registerCategory(def, false);

  const resolveCategory = (raw: string): CategoryBuilder => {
    const known = categoryLookup.get(matchKey(raw));
    if (known) return builders.get(known)!;
    const slug = uniqueSlug(slugify(raw) || "category", (s) => builders.has(s));
    warnOnce(`Category "${raw}" is not in data/taxonomy.ts; it was added without a photo or description.`);
    return registerCategory(
      {
        slug,
        name: raw,
        aliases: [],
        description: "",
        intro: "",
        keywords: [raw.toLowerCase()],
        icon: "generic",
        units: DEFAULT_UNITS,
        subcategories: [],
      },
      true,
    );
  };

  const resolveSubcategory = (builder: CategoryBuilder, raw: string): string => {
    const known = builder.subLookup.get(matchKey(raw));
    if (known) return known;
    const slug = uniqueSlug(slugify(raw) || "other", (s) => builder.subcategories.has(s));
    builder.subcategories.set(slug, { slug, name: raw });
    builder.subLookup.set(matchKey(raw), slug);
    if (!builder.fromSheet) {
      warnOnce(`Subcategory "${raw}" in ${builder.def.name} is not in data/taxonomy.ts; it was added automatically.`);
    }
    return slug;
  };

  // --- Rows -----------------------------------------------------------------
  const products: Product[] = [];
  const rowNumberById = new Map<string, number>();
  const usedIds = new Set<string>();
  const usedSlugs = new Set<string>();
  let hiddenCount = 0;

  rows.slice(1).forEach((row, i) => {
    const rowNumber = i + 2; // as shown in the spreadsheet (header is row 1)
    const get = (field: KnownField) => {
      const index = fieldIndex[field];
      return index === undefined ? "" : (row[index] ?? "").trim();
    };

    const name = get("product_name");
    if (!name) {
      if (row.some((cell) => cell.trim())) warnings.push(`Row ${rowNumber}: skipped, no product name.`);
      return;
    }

    const visibility = parseVisibility(get("status"));
    if (visibility === "hidden") {
      hiddenCount++;
      return;
    }
    if (visibility === "unknown") {
      warnOnce(`Status "${get("status")}" is not recognised; those products are shown. Use "active" or "hidden".`);
    }

    const categoryRaw = get("category");
    if (!categoryRaw) {
      warnings.push(`Row ${rowNumber} (${name}): skipped, no category.`);
      return;
    }
    const builder = resolveCategory(categoryRaw);
    const subcategoryRaw = get("subcategory");
    const subcategorySlug = subcategoryRaw ? resolveSubcategory(builder, subcategoryRaw) : undefined;

    // Stable id: from the sheet, or derived from the name.
    let id = get("id");
    if (!id) id = slugify(name) || `row-${rowNumber}`;
    if (usedIds.has(id)) {
      const newId = uniqueSlug(id, (candidate) => usedIds.has(candidate));
      warnings.push(`Row ${rowNumber} (${name}): id "${id}" is used twice; this row uses "${newId}".`);
      id = newId;
    }
    usedIds.add(id);

    let slug = slugify(get("slug") || name) || slugify(id);
    if (usedSlugs.has(slug)) slug = uniqueSlug(`${slug}-${slugify(id)}`, (candidate) => usedSlugs.has(candidate));
    usedSlugs.add(slug);

    const rawImage = get("image_url");
    const imageUrl = normalizeImageUrl(rawImage);
    if (rawImage && !imageUrl) warnings.push(`Row ${rowNumber} (${name}): image link "${rawImage}" is not a valid URL.`);

    const description = get("description").replace(/\s+\n/g, "\n");
    const { specs, features } = parseSpecifications(get("specifications"));
    const units = parseUnitList(get("units"));
    const sortValue = Number.parseFloat(get("sort_order"));

    const attributes: SpecRow[] = extraColumns
      .map(({ index, label }) => ({ label, value: (row[index] ?? "").trim() }))
      .filter((attribute) => attribute.value);

    products.push({
      id,
      slug,
      name,
      categorySlug: builder.def.slug,
      subcategorySlug,
      brand: get("brand") || undefined,
      description,
      summary: summarize(description),
      image: imageUrl ? { src: imageUrl, remote: !imageUrl.startsWith("/") } : undefined,
      specifications: specs,
      features,
      attributes,
      units: units.length ? units : builder.def.units,
      featured: parseBoolean(get("featured")),
      sortOrder: Number.isFinite(sortValue) ? sortValue : 100_000 + rowNumber,
      tags: get("tags")
        .split(/[,|]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    rowNumberById.set(id, rowNumber);
  });

  if (products.length === 0) {
    throw new CatalogValidationError(
      `No visible products found (${rows.length - 1} rows read, ${hiddenCount} hidden). Check the product_name, category and status columns.`,
    );
  }

  products.sort(
    (a, b) => a.sortOrder - b.sortOrder || rowNumberById.get(a.id)! - rowNumberById.get(b.id)!,
  );

  // --- Assemble categories --------------------------------------------------
  const categories: Category[] = [...builders.values()].map((builder) => {
    const inCategory = products.filter((p) => p.categorySlug === builder.def.slug);
    const subcategories: Subcategory[] = [...builder.subcategories.values()].map((sub) => ({
      ...sub,
      productCount: inCategory.filter((p) => p.subcategorySlug === sub.slug).length,
    }));
    const photo = builder.def.photo ? options.photos?.[builder.def.photo] : undefined;
    const image: CategoryImage | undefined = photo
      ? {
          base: photo.base,
          widths: photo.widths,
          width: photo.width,
          height: photo.height,
          alt: photo.alt,
          position: photo.position,
        }
      : undefined;

    return {
      slug: builder.def.slug,
      name: builder.def.name,
      description: builder.def.description,
      intro: builder.def.intro || builder.def.description,
      keywords: builder.def.keywords,
      image,
      icon: builder.def.icon,
      units: builder.def.units,
      subcategories,
      productCount: inCategory.length,
    };
  });

  return {
    categories,
    products,
    warnings,
    hiddenCount,
  };
}

function uniqueSlug(base: string, taken: (candidate: string) => boolean): string {
  if (!taken(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken(candidate)) return candidate;
  }
}

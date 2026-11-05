/**
 * Catalogue data model.
 *
 * Google Sheet row  ->  RawProductRow (strings keyed by normalised header)
 *                   ->  Product (validated, typed, ready for the UI)
 *
 * The generated `data/generated/catalog.json` file is a `CatalogData` object.
 */

/** One sheet row after header normalisation: `{ product_name: "...", category: "..." }`. */
export type RawProductRow = Record<string, string>;

/** A label/value pair shown in a specification table. */
export interface SpecRow {
  label: string;
  value: string;
}

/** An image that has been processed (or linked) at build time. */
export interface ProductImage {
  /** Default `src` (largest processed size, or the remote URL). */
  src: string;
  /** `srcset` string when several sizes exist. */
  srcSet?: string;
  width?: number;
  height?: number;
  /** True when the image is served from the original remote URL. */
  remote?: boolean;
}

export interface Product {
  /** Stable identifier (sheet `id` column, or derived from the name). */
  id: string;
  /** URL segment: /product/<slug>/ */
  slug: string;
  name: string;
  categorySlug: string;
  /** Empty when the row has no subcategory. */
  subcategorySlug?: string;
  brand?: string;
  description: string;
  /** One-sentence summary used on cards and in meta descriptions. */
  summary: string;
  image?: ProductImage;
  /** Parsed from the `specifications` column ("Thickness: 18 mm | Size: 8 x 4 ft"). */
  specifications: SpecRow[];
  /** Specification lines without a "label:" part. */
  features: string[];
  /** Any extra sheet columns, shown automatically as additional details. */
  attributes: SpecRow[];
  /** Units a customer can choose. The first one is the default. */
  units: string[];
  featured: boolean;
  sortOrder: number;
  tags: string[];
}

export interface Subcategory {
  slug: string;
  name: string;
  description?: string;
  productCount: number;
}

export interface CategoryImage {
  /** Base path without extension/width, e.g. `/images/plywood`. */
  base: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  /** CSS object-position for cropping. */
  position?: string;
}

export interface Category {
  slug: string;
  name: string;
  /** One or two plain sentences for cards. */
  description: string;
  /** Longer copy for the category page and its meta description. */
  intro: string;
  /** Search words for SEO copy (hardware, plywood, ...). */
  keywords: string[];
  image?: CategoryImage;
  /** Icon name from the shared icon map (used when a product has no photo). */
  icon: CategoryIconName;
  /** Default units for products in this category. */
  units: string[];
  subcategories: Subcategory[];
  productCount: number;
}

export type CategoryIconName =
  | "hardware"
  | "electricals"
  | "plywood"
  | "roofing"
  | "steel"
  | "pipes"
  | "cladding"
  | "doors"
  | "generic";

export type CatalogSource = "google-sheets" | "cache" | "sample";

export interface CatalogMeta {
  source: CatalogSource;
  generatedAt: string;
  productCount: number;
  warnings: string[];
}

export interface CatalogData {
  meta: CatalogMeta;
  categories: Category[];
  products: Product[];
}

/**
 * The small slice of a product the browser needs to add it to "My requirements".
 * Kept separate so pages do not ship full product data to the client.
 */
export interface ProductRef {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  subcategoryName?: string;
  brand?: string;
  /** Small image URL for the requirements list. */
  thumb?: string;
  units: string[];
}

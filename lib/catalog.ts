/**
 * Catalogue data access for pages (server side, build time).
 *
 * Reads `data/generated/catalog.json`, written by `scripts/sync-catalog.ts`.
 * Only server components import this module, so the full catalogue is never
 * shipped to the browser; pages pass down just what they render.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CatalogData, Category, Product, ProductRef, Subcategory } from "@/types/catalog";

const CATALOG_FILE = path.join(process.cwd(), "data", "generated", "catalog.json");
let cached: CatalogData | null = null;

function load(): CatalogData {
  // Re-read in development so `npm run sync` shows up without restarting.
  if (cached && process.env.NODE_ENV === "production") return cached;
  try {
    cached = JSON.parse(readFileSync(CATALOG_FILE, "utf8")) as CatalogData;
  } catch (error) {
    throw new Error(
      `Catalogue not found at data/generated/catalog.json. Run \`npm run sync\` (or \`npm run sync -- --sample\`) first.`,
      { cause: error },
    );
  }
  return cached;
}

export function getCatalogMeta() {
  return load().meta;
}

export function getCategories(): Category[] {
  return load().categories;
}

/** Categories that have at least one product, in taxonomy order. */
export function getActiveCategories(): Category[] {
  return getCategories().filter((category) => category.productCount > 0);
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((category) => category.slug === slug);
}

export function getSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): { category: Category; subcategory: Subcategory } | undefined {
  const category = getCategory(categorySlug);
  const subcategory = category?.subcategories.find((sub) => sub.slug === subcategorySlug);
  return category && subcategory ? { category, subcategory } : undefined;
}

export function getProducts(): Product[] {
  return load().products;
}

export function getProduct(slug: string): Product | undefined {
  return getProducts().find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return getProducts().filter((product) => product.categorySlug === categorySlug);
}

export function getProductsBySubcategory(categorySlug: string, subcategorySlug: string): Product[] {
  return getProducts().filter(
    (product) => product.categorySlug === categorySlug && product.subcategorySlug === subcategorySlug,
  );
}

/** Same subcategory first, then the rest of the category. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = getProductsByCategory(product.categorySlug).filter((p) => p.id !== product.id);
  const sameSub = sameCategory.filter((p) => p.subcategorySlug && p.subcategorySlug === product.subcategorySlug);
  const others = sameCategory.filter((p) => !sameSub.includes(p));
  return [...sameSub, ...others].slice(0, limit);
}

export function getSubcategoryName(product: Product): string | undefined {
  if (!product.subcategorySlug) return undefined;
  return getCategory(product.categorySlug)?.subcategories.find((sub) => sub.slug === product.subcategorySlug)?.name;
}

/** The small, serialisable slice of a product the "Add to requirement" buttons need. */
export function toProductRef(product: Product): ProductRef {
  const category = getCategory(product.categorySlug);
  const thumb = product.image?.srcSet?.split(",")[0]?.trim().split(" ")[0] ?? product.image?.src;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryName: category?.name ?? product.categorySlug,
    subcategoryName: getSubcategoryName(product),
    brand: product.brand,
    thumb,
    units: product.units,
  };
}

/** Plain text used by the client-side search box. */
export function searchText(product: Product): string {
  const category = getCategory(product.categorySlug);
  return [
    product.name,
    product.brand,
    category?.name,
    getSubcategoryName(product),
    product.summary,
    product.id,
    ...product.tags,
    ...product.specifications.map((spec) => spec.value),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

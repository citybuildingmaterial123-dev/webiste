import type { MetadataRoute } from "next";
import { getActiveCategories, getCatalogMeta, getProducts } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getCatalogMeta().generatedAt);
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified,
    priority,
  });

  return [
    page(routes.home, 1),
    page(routes.products, 0.9),
    page(routes.about, 0.5),
    page(routes.contact, 0.6),
    ...getActiveCategories().flatMap((category) => [
      page(routes.category(category.slug), 0.8),
      ...category.subcategories
        .filter((sub) => sub.productCount > 0)
        .map((sub) => page(routes.subcategory(category.slug, sub.slug), 0.7)),
    ]),
    ...getProducts().map((product) => page(routes.product(product.slug), 0.6)),
  ];
}

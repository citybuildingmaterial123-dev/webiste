import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SubcategoryNav } from "@/components/catalog/SubcategoryNav";
import { CloseBand } from "@/components/layout/CloseBand";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/business";
import { getCategories, getProductsBySubcategory, getSubcategory } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { locationSuffix, pageMetadata } from "@/lib/seo";

type Params = { category: string; subcategory: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories().flatMap((category) =>
    category.subcategories.map((sub) => ({ category: category.slug, subcategory: sub.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: categorySlug, subcategory: subSlug } = await params;
  const found = getSubcategory(categorySlug, subSlug);
  if (!found) return {};
  const { category, subcategory } = found;
  return pageMetadata({
    title: `${subcategory.name} | ${category.name}${locationSuffix()}`,
    description:
      subcategory.description ??
      `${subcategory.name} in our ${category.name.toLowerCase()} range${locationSuffix()}. See the products, add them to your list and request a quotation on WhatsApp.`,
    path: routes.subcategory(category.slug, subcategory.slug),
    // Empty listings stay out of search results until products are added.
    noIndex: subcategory.productCount === 0,
  });
}

export default async function SubcategoryPage({ params }: { params: Promise<Params> }) {
  const { category: categorySlug, subcategory: subSlug } = await params;
  const found = getSubcategory(categorySlug, subSlug);
  if (!found) notFound();
  const { category, subcategory } = found;
  const products = getProductsBySubcategory(category.slug, subcategory.slug);

  return (
    <>
      <div className="page-pad">
        <div className="wrap">
          <CatalogHeader
            crumbs={[
              { name: "Home", path: routes.home },
              { name: "Products", path: routes.products },
              { name: category.name, path: routes.category(category.slug) },
              { name: subcategory.name, path: routes.subcategory(category.slug, subcategory.slug) },
            ]}
            eyebrow={category.name}
            title={subcategory.name}
            intro={subcategory.description}
            meta={`${products.length} ${products.length === 1 ? "product" : "products"}`}
          />
          <div className="mt-12">
            <SubcategoryNav category={category} activeSlug={subcategory.slug} />
          </div>
          <section aria-labelledby="listing-title" className="mt-10">
            <h2 id="listing-title" className="sr-only">
              {subcategory.name} products
            </h2>
            {products.length > 0 ? (
              <ProductListing products={products} scopeLabel={subcategory.name} />
            ) : (
              <div className="border border-line bg-paper px-6 py-12 sm:px-12">
                <p className="text-name-sm sm:text-name">{subcategory.name} is not listed online yet.</p>
                <p className="mt-2 max-w-[52ch] text-body text-muted">
                  Ask us on WhatsApp for the sizes, brands and stock available in store.
                </p>
                <a
                  href={whatsappUrl(`Hello ${siteConfig.name}, I would like to know about ${subcategory.name} (${category.name}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary mt-6"
                >
                  <WhatsAppIcon />
                  Ask about {subcategory.name}
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
      <CloseBand />
    </>
  );
}

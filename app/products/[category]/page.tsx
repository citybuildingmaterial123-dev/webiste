import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SubcategoryNav } from "@/components/catalog/SubcategoryNav";
import { CloseBand } from "@/components/layout/CloseBand";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { locationSuffix, pageMetadata } from "@/lib/seo";
import { photoSrcSet } from "@/components/ui/Photo";

type Params = { category: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const image = category.image ? photoSrcSet(category.image).split(", ").at(-1)?.split(" ")[0] : undefined;
  return pageMetadata({
    title: `${category.name}${locationSuffix()}`,
    description: `${category.intro} Request a quotation on WhatsApp.`.slice(0, 300),
    path: routes.category(category.slug),
    image,
    noIndex: category.productCount === 0,
  });
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = getProductsByCategory(category.slug);
  const subWithProducts = category.subcategories.filter((sub) => sub.productCount > 0).length;

  return (
    <>
      <div className="page-pad">
        <div className="wrap">
          <CatalogHeader
            crumbs={[
              { name: "Home", path: routes.home },
              { name: "Products", path: routes.products },
              { name: category.name, path: routes.category(category.slug) },
            ]}
            title={category.name}
            intro={category.intro}
            meta={`${products.length} ${products.length === 1 ? "product" : "products"} in ${subWithProducts} ${subWithProducts === 1 ? "subcategory" : "subcategories"}`}
            image={category.image}
          />
          <div className="mt-12">
            <SubcategoryNav category={category} />
          </div>
          <section aria-labelledby="listing-title" className="mt-10">
            <h2 id="listing-title" className="sr-only">
              {category.name} products
            </h2>
            <ProductListing products={products} scopeLabel={category.name} />
          </section>
        </div>
      </div>
      <CloseBand />
    </>
  );
}

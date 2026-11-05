import type { Metadata } from "next";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductListing } from "@/components/catalog/ProductListing";
import { CloseBand } from "@/components/layout/CloseBand";
import { getActiveCategories, getProducts } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { locationSuffix, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Building materials catalogue",
  description: `Browse hardware, electricals, plywood, roofing sheets, stainless steel, MS and GI pipes, cladding sheets and doors${locationSuffix()}. Add products to your list and request a quotation.`,
  path: routes.products,
});

export default function ProductsPage() {
  const categories = getActiveCategories();
  const products = getProducts();

  return (
    <>
      <div className="page-pad">
        <div className="wrap">
          <CatalogHeader
            crumbs={[
              { name: "Home", path: routes.home },
              { name: "Products", path: routes.products },
            ]}
            title="Products"
            intro="Choose a category, or search the full catalogue. Add what you need to your requirements and send the list to us for a quotation."
          />

          <section aria-labelledby="categories-title" className="mt-14">
            <h2 id="categories-title" className="sr-only">
              Categories
            </h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-4">
              {categories.map((category, index) => (
                <li key={category.slug}>
                  <CategoryCard category={category} priority={index < 4} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="all-title" className="mt-20 sm:mt-28">
            <h2 id="all-title" className="mb-6 text-h2-sm sm:text-h2">
              All products
            </h2>
            <ProductListing products={products} scopeLabel="all products" />
          </section>
        </div>
      </div>
      <CloseBand />
    </>
  );
}

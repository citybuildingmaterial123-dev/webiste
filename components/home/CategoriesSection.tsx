import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { getActiveCategories, getProducts } from "@/lib/catalog";
import { routes } from "@/lib/routes";

export function CategoriesSection() {
  const categories = getActiveCategories();
  const productCount = getProducts().length;

  return (
    <section id="categories" aria-labelledby="categories-title" className="section-pad">
      <div className="wrap">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h2 id="categories-title" className="text-h2-sm sm:text-h2">
            Product categories
          </h2>
          <p className="text-body text-muted sm:text-right">
            {categories.length} categories, {productCount} products listed.{" "}
            <Link href={routes.products} className="link inline-flex items-center gap-1 font-medium whitespace-nowrap text-ink">
              See all products
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:mt-12 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

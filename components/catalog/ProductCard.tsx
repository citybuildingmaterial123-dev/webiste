import Link from "next/link";
import type { Category, Product } from "@/types/catalog";
import { AddToRequirementButton } from "@/components/requirements/AddToRequirementButton";
import { getSubcategoryName, toProductRef } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { ProductImage } from "./ProductImage";

const SIZES = "(min-width: 1280px) 282px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 96px";

/**
 * Product card: photo on white, subcategory, name, brand, one line of description
 * and "Add to requirement". No prices anywhere.
 * Phones get a compact row (photo left); wider screens a vertical card.
 */
export function ProductCard({ product, category }: { product: Product; category?: Category }) {
  const subcategory = getSubcategoryName(product);
  return (
    <article className="card-linked flex h-full gap-4 border border-line bg-paper p-3 sm:flex-col sm:gap-0 sm:p-0">
      <div className="zoom-frame aspect-square w-24 shrink-0 self-start border border-line sm:w-full sm:border-0 sm:border-b">
        <ProductImage
          image={product.image}
          alt={product.name}
          icon={category?.icon ?? "generic"}
          sizes={SIZES}
          zoom
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col sm:p-5">
        <p className="text-label text-muted">{subcategory ?? category?.name}</p>
        <h3 className="mt-1.5 line-clamp-2 text-body leading-6 font-medium">
          <Link href={routes.product(product.slug)} className="stretched-link card-title">
            {product.name}
          </Link>
        </h3>
        {product.brand && <p className="mt-0.5 text-small text-muted">{product.brand}</p>}
        {product.summary && (
          <p className="mt-2 line-clamp-2 hidden text-body text-muted sm:block">{product.summary}</p>
        )}
        <div className="mt-auto pt-3 sm:pt-5">
          <AddToRequirementButton product={toProductRef(product)} />
        </div>
      </div>
    </article>
  );
}

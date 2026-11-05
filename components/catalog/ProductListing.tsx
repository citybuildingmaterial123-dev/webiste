import type { Product } from "@/types/catalog";
import { getCategory, searchText } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/business";
import { CatalogBrowser, FilterItem } from "./CatalogBrowser";
import { ProductCard } from "./ProductCard";

/** Server wrapper: renders the cards and hands the search index to the client browser. */
export function ProductListing({ products, scopeLabel }: { products: Product[]; scopeLabel: string }) {
  return (
    <CatalogBrowser
      index={products.map((product) => ({ id: product.id, text: searchText(product) }))}
      scopeLabel={scopeLabel}
      whatsappHref={whatsappUrl()}
    >
      {products.map((product) => (
        <FilterItem key={product.id} id={product.id}>
          <ProductCard product={product} category={getCategory(product.categorySlug)} />
        </FilterItem>
      ))}
    </CatalogBrowser>
  );
}

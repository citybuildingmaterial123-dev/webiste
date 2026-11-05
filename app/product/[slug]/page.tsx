import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductImage } from "@/components/catalog/ProductImage";
import { CloseBand } from "@/components/layout/CloseBand";
import { RequirementEditor } from "@/components/requirements/RequirementEditor";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/business";
import { getCategory, getProduct, getProducts, getRelatedProducts, getSubcategoryName, toProductRef } from "@/lib/catalog";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { buildProductQuestionMessage } from "@/lib/whatsapp";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const category = getCategory(product.categorySlug);
  const subcategory = getSubcategoryName(product);
  const context = [product.brand, subcategory, category?.name].filter(Boolean).join(", ");
  const description =
    `${product.summary || product.name}${product.summary ? "" : "."} ${context ? `${context}. ` : ""}Add it to your list and request a quotation on WhatsApp.`.trim();
  return pageMetadata({
    title: subcategory ? `${product.name} | ${subcategory}` : product.name,
    description: description.slice(0, 300),
    path: routes.product(product.slug),
    image: product.image && !product.image.remote ? product.image.src : undefined,
  });
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const subcategoryName = getSubcategoryName(product);
  const related = getRelatedProducts(product, 4);

  const crumbs: Crumb[] = [
    { name: "Home", path: routes.home },
    { name: "Products", path: routes.products },
    ...(category ? [{ name: category.name, path: routes.category(category.slug) }] : []),
    ...(category && product.subcategorySlug && subcategoryName
      ? [{ name: subcategoryName, path: routes.subcategory(category.slug, product.subcategorySlug) }]
      : []),
    { name: product.name, path: routes.product(product.slug) },
  ];

  const hasDetails = product.specifications.length > 0 || product.features.length > 0 || product.attributes.length > 0;

  return (
    <>
      <div className="page-pad">
        <div className="wrap">
          <Breadcrumbs items={crumbs} />

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-6">
              <div className="aspect-square overflow-hidden border border-line bg-paper">
                <ProductImage
                  image={product.image}
                  alt={product.name}
                  icon={category?.icon ?? "generic"}
                  sizes="(min-width: 1280px) 588px, (min-width: 1024px) 45vw, 100vw"
                  priority
                />
              </div>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <p className="text-label font-medium text-muted">
                {[category?.name, subcategoryName].filter(Boolean).join(" › ")}
              </p>
              <h1 className="mt-2 text-h2-sm sm:text-h1-sm">{product.name}</h1>
              {product.brand && (
                <p className="mt-2 text-body text-muted">
                  Brand: <span className="text-ink">{product.brand}</span>
                </p>
              )}
              {product.description && (
                <div className="mt-5 grid gap-3 text-body">
                  {product.description.split(/\n+/).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <RequirementEditor product={toProductRef(product)} />
              </div>

              <p className="mt-6 text-body text-muted">
                Questions about sizes, grades or stock?{" "}
                <a
                  href={whatsappUrl(buildProductQuestionMessage(siteConfig.name, product))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link inline-flex items-center gap-1.5 font-medium text-ink"
                >
                  <WhatsAppIcon className="size-4 self-center" />
                  Ask about this product
                </a>
              </p>
            </div>
          </div>

          {hasDetails && (
            <section aria-labelledby="specs-title" className="mt-20 grid gap-8 lg:grid-cols-12 lg:gap-6">
              <h2 id="specs-title" className="text-h2-sm sm:text-h2 lg:col-span-4">
                Specifications
              </h2>
              <div className="lg:col-span-8">
                {[...product.specifications, ...product.attributes].length > 0 && (
                  <dl>
                    {[...product.specifications, ...product.attributes].map((row) => (
                      <div
                        key={`${row.label}-${row.value}`}
                        className="grid gap-1 border-b border-line py-3.5 first:border-t sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6"
                      >
                        <dt className="text-body text-muted">{row.label}</dt>
                        <dd className="text-body">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {product.features.length > 0 && (
                  <ul className="mt-6 grid gap-2 text-body">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-[11px] size-1.5 shrink-0 bg-accent" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-6 text-small text-muted">
                  Specifications can vary by batch and brand. We confirm the exact details with your quotation.
                </p>
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-24">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 id="related-title" className="text-h2-sm sm:text-h2">
                  Related products
                </h2>
                {category && (
                  <Link
                    href={routes.category(category.slug)}
                    className="link inline-flex items-center gap-1 text-body font-medium"
                  >
                    See all {category.name}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {related.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} category={getCategory(item.categorySlug)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <CloseBand />
    </>
  );
}

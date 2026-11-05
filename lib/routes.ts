/**
 * Every internal URL in one place. All paths end with "/" to match
 * `trailingSlash: true` in next.config.ts (static hosting friendly).
 */
export const routes = {
  home: "/",
  products: "/products/",
  category: (categorySlug: string) => `/products/${categorySlug}/`,
  subcategory: (categorySlug: string, subcategorySlug: string) => `/products/${categorySlug}/${subcategorySlug}/`,
  product: (productSlug: string) => `/product/${productSlug}/`,
  requirements: "/requirements/",
  quoteForm: "/requirements/#quote",
  about: "/about/",
  contact: "/contact/",
  privacy: "/privacy/",
  credits: "/credits/",
} as const;

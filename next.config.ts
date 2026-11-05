import type { NextConfig } from "next";

/**
 * The site is exported as plain static files (HTML/CSS/JS) into `out/`.
 * Product data is fetched from Google Sheets by `scripts/sync-catalog.ts`
 * BEFORE `next build` runs (see the `prebuild` npm script), so visitors
 * never depend on Google Sheets at page-load time.
 */
const nextConfig: NextConfig = {
  output: "export",
  // `/products/` -> `out/products/index.html`: works on every static host
  // (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Apache/cPanel, Nginx).
  trailingSlash: true,
  // Product photos are resized to WebP at build time by the sync script,
  // so the runtime image optimizer (which needs a server) is not used.
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

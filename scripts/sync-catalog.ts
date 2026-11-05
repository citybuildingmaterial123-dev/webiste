/**
 * Catalogue sync: runs automatically before `next build` (and before `next dev`
 * when no catalogue exists yet).
 *
 *   Google Sheet -> fetch -> validate & transform -> optimise photos -> data/generated/catalog.json
 *
 * Usage:
 *   npm run sync                 fetch from Google Sheets now
 *   npm run sync -- --sample     use data/sample-products.csv
 *   npm run sync -- --skip-images
 *
 * Fallback when the sheet cannot be read:
 *   strict mode (CI, or CATALOG_STRICT=true)  -> stop the build. Your host keeps
 *                                               serving the previous deployment.
 *   otherwise                                -> last good copy, else sample data.
 */
import { loadEnvConfig } from "@next/env";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogData, CatalogSource } from "@/types/catalog";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "catalog.json");
const SAMPLE_FILE = path.join(ROOT, "data", "sample-products.csv");

const args = new Set(process.argv.slice(2));
const log = (message = "") => console.log(`[catalog] ${message}`);
const warn = (message: string) => console.warn(`[catalog] warning: ${message}`);

async function main() {
  // Same .env loading rules as Next.js (.env.local, then .env.development or .env.production, then .env).
  loadEnvConfig(ROOT, args.has("--dev"));

  // Imported after the environment is loaded, because they read process.env.
  const { taxonomy } = await import("@/data/taxonomy");
  const { photos } = await import("@/data/photos");
  const { siteConfig } = await import("@/config/site");
  const { buildCatalog } = await import("@/lib/catalog-transform");
  const { fetchSheetRows, isSheetConfigured, resolveAccessMode, sheetConfigFromEnv } = await import("@/lib/googleSheets");
  const { parseCsv } = await import("@/lib/csv");
  const { getConfigWarnings } = await import("@/lib/config-check");
  const { processProductImages } = await import("./lib/product-images");

  if (args.has("--if-missing") && existsSync(OUT_FILE)) {
    log("catalogue already exists; run `npm run sync` to refresh it from Google Sheets.");
    return;
  }

  const strict = process.env.CATALOG_STRICT
    ? process.env.CATALOG_STRICT === "true"
    : Boolean(process.env.CI && process.env.CI !== "false");

  const sheet = sheetConfigFromEnv();
  const build = (rows: string[][]) => buildCatalog(rows, { taxonomy, photos });
  const loadSample = async () => build(parseCsv(await readFile(SAMPLE_FILE, "utf8")));

  let source: CatalogSource;
  let result: ReturnType<typeof buildCatalog>;

  if (args.has("--sample")) {
    log("using sample data (--sample).");
    source = "sample";
    result = await loadSample();
  } else if (!isSheetConfigured(sheet)) {
    log("no Google Sheet configured (GOOGLE_SHEET_ID); using data/sample-products.csv.");
    source = "sample";
    result = await loadSample();
  } else {
    try {
      log(`reading Google Sheet (${resolveAccessMode(sheet)})...`);
      const { rows } = await fetchSheetRows(sheet);
      result = build(rows);
      source = "google-sheets";
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[catalog] could not load the Google Sheet: ${reason}`);

      if (strict) {
        console.error(
          "[catalog] Build stopped (strict mode). Your host keeps serving the previous version of the site.\n" +
            "[catalog] Fix the sheet or its sharing settings and build again. Set CATALOG_STRICT=false to allow fallbacks.",
        );
        process.exit(1);
      }

      const cached = await readCache();
      if (cached && cached.meta.source !== "sample") {
        warn(`using the last good catalogue from ${cached.meta.generatedAt}.`);
        cached.meta = { ...cached.meta, source: "cache", warnings: [...cached.meta.warnings, `Sheet fetch failed: ${reason}`] };
        await writeCatalog(cached);
        summarize(cached, getConfigWarnings(siteConfig));
        return;
      }
      warn("no previous catalogue found; using data/sample-products.csv.");
      source = "sample";
      result = await loadSample();
    }
  }

  const imageMode = process.env.CATALOG_IMAGES === "remote" || args.has("--skip-images") ? "remote" : "optimize";
  if (imageMode === "optimize") {
    const withPhotos = result.products.filter((p) => p.image?.remote).length;
    // Always runs: it also removes photos of products that no longer exist.
    const images = await processProductImages(result.products);
    if (withPhotos > 0) {
      log(`photos: ${images.processed} new, ${images.reused} cached, ${images.failed.length} failed.`);
      for (const failure of images.failed) {
        result.warnings.push(
          `Photo for "${failure.product}" could not be processed (${failure.reason}); ` +
            (failure.dropped ? "the product is shown without a photo." : "linking the original."),
        );
      }
    }
  }

  const catalog: CatalogData = {
    meta: {
      source,
      generatedAt: new Date().toISOString(),
      productCount: result.products.length,
      warnings: result.warnings,
    },
    categories: result.categories,
    products: result.products,
  };
  await writeCatalog(catalog);
  if (result.hiddenCount) log(`${result.hiddenCount} hidden/draft rows skipped.`);
  summarize(catalog, getConfigWarnings(siteConfig));
}

async function readCache(): Promise<CatalogData | null> {
  try {
    return JSON.parse(await readFile(OUT_FILE, "utf8")) as CatalogData;
  } catch {
    return null;
  }
}

async function writeCatalog(catalog: CatalogData) {
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(catalog, null, 2));
}

function summarize(catalog: CatalogData, configWarnings: string[]) {
  const used = catalog.categories.filter((c) => c.productCount > 0).length;
  log(`${catalog.meta.productCount} products in ${used} categories (source: ${catalog.meta.source}).`);
  log(`written to ${path.relative(ROOT, OUT_FILE)}`);
  for (const message of catalog.meta.warnings) warn(message);
  for (const message of configWarnings) warn(`config: ${message}`);
}

main().catch((error) => {
  console.error("[catalog] sync failed:", error);
  process.exit(1);
});

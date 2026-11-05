/**
 * Build-time product image pipeline.
 *
 * Downloads each product photo linked in the sheet once, converts it to small
 * WebP files (480 and 960 px) in /public/media/products, and points the product
 * at those files. Results are cached by URL, so unchanged photos are not
 * downloaded again. If a photo cannot be downloaded the original link is kept.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Product } from "@/types/catalog";

const MEDIA_DIR = path.join(process.cwd(), "public", "media", "products");
const PUBLIC_PREFIX = "/media/products";
const TARGET_WIDTHS = [480, 960];
const MAX_BYTES = 25 * 1024 * 1024;
const TIMEOUT_MS = 25_000;

interface ImageMeta {
  url: string;
  files: { file: string; width: number; height: number }[];
}

export interface ImagePipelineResult {
  processed: number;
  reused: number;
  failed: { product: string; url: string; reason: string; dropped: boolean }[];
}

export async function processProductImages(
  products: Product[],
  { concurrency = 6 }: { concurrency?: number } = {},
): Promise<ImagePipelineResult> {
  await mkdir(MEDIA_DIR, { recursive: true });
  const result: ImagePipelineResult = { processed: 0, reused: 0, failed: [] };
  const keep = new Set<string>();
  const queue = products.filter((product) => product.image?.remote);

  await runWithConcurrency(queue, concurrency, async (product) => {
    const url = product.image!.src;
    const key = createHash("sha1").update(url).digest("hex").slice(0, 16);
    keep.add(key);
    const metaPath = path.join(MEDIA_DIR, `${key}.json`);

    try {
      let meta = await readCachedMeta(metaPath);
      if (meta) {
        result.reused++;
      } else {
        meta = await downloadAndConvert(url, key);
        await writeFile(metaPath, JSON.stringify(meta));
        result.processed++;
      }

      const largest = meta.files[meta.files.length - 1];
      product.image = {
        src: `${PUBLIC_PREFIX}/${largest.file}`,
        srcSet: meta.files.map((f) => `${PUBLIC_PREFIX}/${f.file} ${f.width}w`).join(", "),
        width: largest.width,
        height: largest.height,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      // A missing or non-image link would show a broken picture: drop it.
      // Anything else (timeout, network) may work for visitors, so keep the link.
      const permanent = /^HTTP 4\d\d|not an image|unsupported image|Input buffer/i.test(reason);
      if (permanent) product.image = undefined;
      result.failed.push({ product: product.name, url, reason, dropped: permanent });
    }
  });

  await removeUnused(keep);
  return result;
}

async function readCachedMeta(metaPath: string): Promise<ImageMeta | null> {
  if (!existsSync(metaPath)) return null;
  try {
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as ImageMeta;
    const complete = meta.files.length > 0 && meta.files.every((f) => existsSync(path.join(MEDIA_DIR, f.file)));
    return complete ? meta : null;
  } catch {
    return null;
  }
}

async function downloadAndConvert(url: string, key: string): Promise<ImageMeta> {
  const response = await fetch(url, {
    headers: { "User-Agent": "catalog-sync/1.0 (product image download)" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = response.headers.get("content-type") ?? "";
  if (type && !type.startsWith("image/") && !type.startsWith("application/octet-stream")) {
    throw new Error(`not an image (content-type ${type}); is the file shared publicly?`);
  }
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new Error("file larger than 25 MB");

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) throw new Error("file larger than 25 MB");

  const files: ImageMeta["files"] = [];
  for (const target of TARGET_WIDTHS) {
    const file = `${key}-${target}.webp`;
    const info = await sharp(buffer, { failOn: "none" })
      .rotate() // respect EXIF orientation from phone photos
      .resize({ width: target, height: target, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(MEDIA_DIR, file));
    // Small originals produce identical sizes; keep one.
    if (!files.some((f) => f.width === info.width)) files.push({ file, width: info.width, height: info.height });
  }
  return { url, files };
}

async function removeUnused(keep: Set<string>) {
  const entries = await readdir(MEDIA_DIR).catch(() => [] as string[]);
  await Promise.all(
    entries
      .filter((name) => !keep.has(name.split(/[-.]/)[0]))
      .map((name) => rm(path.join(MEDIA_DIR, name), { force: true })),
  );
}

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

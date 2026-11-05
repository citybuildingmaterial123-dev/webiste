/* eslint-disable @next/next/no-img-element -- static export: photos are pre-resized WebP files with their own srcset. */
import type { CategoryImage } from "@/types/catalog";

interface PhotoProps {
  image: CategoryImage;
  /** Rendered width hint for the browser, e.g. "(min-width: 1280px) 282px, 50vw". */
  sizes: string;
  className?: string;
  /** Above-the-fold photo: load eagerly with high priority. */
  priority?: boolean;
  /** Empty string marks a decorative photo. */
  alt?: string;
}

export function photoSrcSet(image: CategoryImage): string {
  return image.widths.map((w) => `${image.base}-${w}.webp ${w}w`).join(", ");
}

export function Photo({ image, sizes, className, priority, alt }: PhotoProps) {
  const fallback = image.widths[Math.min(1, image.widths.length - 1)];
  return (
    <img
      src={`${image.base}-${fallback}.webp`}
      srcSet={photoSrcSet(image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}

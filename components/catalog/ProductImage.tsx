/* eslint-disable @next/next/no-img-element -- static export: product photos are resized to WebP by the sync script. */
import type { CategoryIconName, ProductImage as ProductImageData } from "@/types/catalog";
import { CategoryIcon } from "@/components/ui/Icons";

interface ProductImageProps {
  image?: ProductImageData;
  alt: string;
  icon: CategoryIconName;
  sizes: string;
  priority?: boolean;
  /** Adds the hover zoom used inside linked cards. */
  zoom?: boolean;
}

/**
 * The product photo on a white backdrop, shown whole (never cropped).
 * Without a photo, a quiet tile with the category icon keeps the grid even.
 */
export function ProductImage({ image, alt, icon, sizes, priority, zoom }: ProductImageProps) {
  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface text-muted" aria-hidden="true">
        <CategoryIcon name={icon} className="size-10 opacity-70" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      referrerPolicy={image.remote ? "no-referrer" : undefined}
      className={`h-full w-full bg-paper object-contain p-[8%] ${zoom ? "zoom-img" : ""}`}
    />
  );
}

import type { CategoryImage } from "@/types/catalog";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Photo } from "@/components/ui/Photo";

interface CatalogHeaderProps {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: string;
  meta?: string;
  image?: CategoryImage;
}

/** Breadcrumbs, title and introduction for the catalogue pages; the photo sits right on wide screens. */
export function CatalogHeader({ crumbs, eyebrow, title, intro, meta, image }: CatalogHeaderProps) {
  return (
    <header className="grid gap-8 lg:grid-cols-12 lg:gap-6">
      <div className={image ? "lg:col-span-6" : "lg:col-span-8"}>
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="mt-8 text-label font-medium text-muted">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-2" : "mt-8"} text-h1-sm sm:text-h1`}>{title}</h1>
        {intro && <p className="mt-4 max-w-[52ch] text-lead-sm text-muted sm:text-lead">{intro}</p>}
        {meta && <p className="mt-4 text-body text-muted tabular">{meta}</p>}
      </div>
      {image && (
        <div className="hidden lg:col-span-6 lg:block">
          <div className="aspect-[3/2] overflow-hidden bg-surface">
            <Photo image={image} alt="" sizes="(min-width: 1280px) 588px, 45vw" priority className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </header>
  );
}

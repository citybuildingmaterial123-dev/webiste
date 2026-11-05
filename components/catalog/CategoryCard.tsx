import Link from "next/link";
import type { Category } from "@/types/catalog";
import { CategoryIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { routes } from "@/lib/routes";

const SIZES = "(min-width: 1280px) 282px, (min-width: 640px) 45vw, 50vw";

/** An open tile: the photograph, then the name and a plain description. The whole tile is the link. */
export function CategoryCard({ category, priority }: { category: Category; priority?: boolean }) {
  return (
    <article className="card-linked h-full">
      <div className="zoom-frame aspect-[4/3] bg-surface">
        {category.image ? (
          <Photo image={category.image} alt="" sizes={SIZES} priority={priority} className="zoom-img h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted" aria-hidden="true">
            <CategoryIcon name={category.icon} className="size-12 opacity-70" strokeWidth={1.1} />
          </div>
        )}
      </div>
      <h3 className="mt-4 text-name-sm sm:text-name">
        <Link href={routes.category(category.slug)} className="stretched-link card-title">
          {category.name}
        </Link>
      </h3>
      <p className="mt-1.5 hidden text-body text-muted sm:block">{category.description}</p>
      <p className="mt-2 text-label text-muted tabular">
        {category.productCount === 1 ? "1 product" : `${category.productCount} products`}
      </p>
    </article>
  );
}

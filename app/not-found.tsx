import Link from "next/link";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="page-pad">
      <div className="wrap max-w-[62ch] py-10">
        <p className="text-label font-medium text-muted">Page not found</p>
        <h1 className="mt-2 text-h1-sm sm:text-h1">This page is not in our catalogue</h1>
        <p className="mt-4 text-lead-sm text-muted sm:text-lead">
          The product may have been renamed or removed. Browse the catalogue or send us your list.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={routes.products} className="btn btn-primary">
            See all products
          </Link>
          <Link href={routes.home} className="btn btn-secondary">
            Go to the home page
          </Link>
        </div>
      </div>
    </div>
  );
}

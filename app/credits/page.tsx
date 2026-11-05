import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { photos } from "@/data/photos";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Photo credits",
  description: "Photographers and licences of the photographs used on this website.",
  path: routes.credits,
  noIndex: true,
});

export default function CreditsPage() {
  const entries = Object.values(photos);
  return (
    <div className="page-pad">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { name: "Home", path: routes.home },
            { name: "Photo credits", path: routes.credits },
          ]}
        />
        <h1 className="mt-8 text-h1-sm sm:text-h1">Photo credits</h1>
        <p className="mt-4 max-w-[56ch] text-lead-sm text-muted sm:text-lead">
          Photographs of materials used under open licences. Some are cropped and resized for this website.
        </p>
        <ul className="mt-10 max-w-[800px]">
          {entries.map((photo) => (
            <li key={photo.base} className="border-b border-line py-4 text-body first:border-t">
              <a href={photo.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="link font-medium">
                {photo.credit.title}
              </a>
              <p className="text-muted">
                {photo.credit.author} ·{" "}
                {photo.credit.licenseUrl ? (
                  <a href={photo.credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="link">
                    {photo.credit.license}
                  </a>
                ) : (
                  photo.credit.license
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

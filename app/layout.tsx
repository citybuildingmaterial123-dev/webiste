import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { ActionBar } from "@/components/layout/ActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/ui/JsonLd";
import { whatsappUrl } from "@/lib/business";
import { localBusinessJsonLd, locationSuffix } from "@/lib/seo";
import "./globals.css";

// Self-hosted at build time by next/font: no request to Google when the page loads.
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}: building materials${locationSuffix()}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.seo.locale,
    url: "/",
    title: `${siteConfig.name}: building materials${locationSuffix()}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.seo.ogImage],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f2ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={workSans.variable}>
      <body>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <ActionBar whatsappHref={whatsappUrl()} />
        <div id="announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        <JsonLd data={localBusinessJsonLd()} />
      </body>
    </html>
  );
}

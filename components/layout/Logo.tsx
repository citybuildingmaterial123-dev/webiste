/* eslint-disable @next/next/no-img-element -- optional client logo file from /public. */
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Stacked-sheets mark: three boards, the middle one in the accent. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="6" width="26" height="5.5" fill="currentColor" />
      <rect x="8" y="13.25" width="21" height="5.5" fill="var(--color-accent)" />
      <rect x="3" y="20.5" width="26" height="5.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ tone = "ink" }: { tone?: "ink" | "inv" }) {
  return (
    <Link
      href="/"
      className={`flex min-w-0 items-center gap-2.5 ${tone === "inv" ? "text-inv-ink" : "text-ink"}`}
      aria-label={`${siteConfig.name}, home`}
    >
      {siteConfig.logo ? (
        <img src={siteConfig.logo} alt="" className="h-8 w-auto" />
      ) : (
        <LogoMark className="size-7 shrink-0" />
      )}
      <span className="truncate text-[17px] leading-none font-medium tracking-[-0.01em] sm:text-[20px]">
        {siteConfig.name}
      </span>
    </Link>
  );
}

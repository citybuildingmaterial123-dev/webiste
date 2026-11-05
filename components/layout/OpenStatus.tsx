"use client";

import { useSyncExternalStore } from "react";
import { getOpenStatus } from "@/lib/business";

// Re-evaluates once a minute while the page is open.
function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => 0;

/**
 * "Open now, until 8:30 pm" in the store's time zone. Rendered only in the
 * browser (the static HTML cannot know the time), so the line is empty
 * until hydration and the hours list beside it always reads correctly.
 */
export function OpenStatus({ className = "" }: { className?: string }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  if (minute === 0) return <span className={className} aria-hidden="true" />;
  const status = getOpenStatus(new Date(minute * 60_000));
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`size-2 rounded-full ${status.open ? "bg-[#15803d]" : "bg-muted"}`}
        aria-hidden="true"
      />
      {status.text}
    </span>
  );
}

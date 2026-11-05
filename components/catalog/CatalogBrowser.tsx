"use client";

import { Search, X } from "lucide-react";
import { createContext, useContext, useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";

interface SearchEntry {
  id: string;
  text: string;
}

const VisibleContext = createContext<Set<string> | null>(null);

interface CatalogBrowserProps {
  /** Lower-case search text for every product, in display order. */
  index: SearchEntry[];
  /** Where the search applies, e.g. "Plywoods" or "all products". */
  scopeLabel: string;
  whatsappHref: string;
  pageSize?: number;
  /** <FilterItem> elements wrapping server-rendered product cards. */
  children: React.ReactNode;
}

/**
 * Search box, result count, product grid and "Show more".
 * The cards are rendered on the server; this component only decides which are visible.
 */
export function CatalogBrowser({ index, scopeLabel, whatsappHref, pageSize = 24, children }: CatalogBrowserProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const deferredQuery = useDeferredValue(query);

  // Read ?q= once on load (links from elsewhere can pre-fill the search).
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (initial) setQuery(initial);
  }, []);

  const matches = useMemo(() => {
    const terms = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return index.map((entry) => entry.id);
    return index.filter((entry) => terms.every((term) => entry.text.includes(term))).map((entry) => entry.id);
  }, [index, deferredQuery]);

  const visible = useMemo(() => new Set(matches.slice(0, limit)), [matches, limit]);
  const remaining = matches.length - visible.size;

  const update = (value: string) => {
    setQuery(value);
    setLimit(pageSize);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[384px]">
          <label htmlFor={inputId} className="sr-only">
            Search {scopeLabel}
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => update(event.target.value)}
            placeholder={`Search ${scopeLabel}`}
            autoComplete="off"
            enterKeyHint="search"
            className="field pr-11 pl-11 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => update("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center text-muted hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="text-body text-muted tabular" aria-live="polite">
          {query.trim()
            ? `${matches.length} ${matches.length === 1 ? "result" : "results"} for “${query.trim()}”`
            : `${matches.length} ${matches.length === 1 ? "product" : "products"}`}
        </p>
      </div>

      <VisibleContext.Provider value={visible}>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">{children}</ul>
      </VisibleContext.Provider>

      {matches.length === 0 && (
        <div className="border border-line bg-paper px-6 py-12 text-center sm:px-12">
          <p className="text-name-sm sm:text-name">No products match “{query.trim()}”.</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-body text-muted">
            Try another word, or ask us on WhatsApp: we stock more than is listed here.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => update("")} className="btn btn-secondary">
              Clear search
            </button>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <WhatsAppIcon />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      )}

      {remaining > 0 && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setLimit((n) => n + pageSize)} className="btn btn-secondary">
            Show {Math.min(remaining, pageSize)} more products
          </button>
        </div>
      )}
    </div>
  );
}

/** A grid cell that hides itself when its product is filtered out. */
export function FilterItem({ id, children }: { id: string; children: React.ReactNode }) {
  const visible = useContext(VisibleContext);
  return <li hidden={visible ? !visible.has(id) : false}>{children}</li>;
}

/**
 * "My requirements": the visitor's material list, kept in localStorage so it
 * survives page reloads and stays in sync across open tabs.
 *
 * A tiny external store read with React's useSyncExternalStore: no context
 * provider, no state library, and no hydration mismatch (the server snapshot
 * is always an empty list).
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ProductRef } from "@/types/catalog";
import type { CustomerDetails, RequirementItem } from "@/types/requirements";

const STORAGE_KEY = "requirements.v1";
const CUSTOMER_KEY = "requirements.customer.v1";
const EMPTY: RequirementItem[] = [];
export const MAX_QUANTITY = 1_000_000;

let items: RequirementItem[] | null = null;
const listeners = new Set<() => void>();
let storageListenerAttached = false;

function isItem(value: unknown): value is RequirementItem {
  const item = value as RequirementItem;
  return (
    !!item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    typeof item.unit === "string" &&
    Array.isArray(item.units)
  );
}

function readStorage(): RequirementItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as { version?: number; items?: unknown[] };
    if (data.version !== 1 || !Array.isArray(data.items)) return EMPTY;
    return data.items.filter(isItem).map((item) => ({ ...item, notes: item.notes ?? "" }));
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: RequirementItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: next }));
  } catch {
    // Private mode or full storage: the list still works until the tab closes.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!storageListenerAttached) {
    storageListenerAttached = true;
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        items = readStorage();
        emit();
      }
    });
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): RequirementItem[] {
  if (items === null) items = readStorage();
  return items;
}

function getServerSnapshot(): RequirementItem[] {
  return EMPTY;
}

/** Rounds to 2 decimals and keeps the value within 0 < q <= MAX_QUANTITY. */
export function sanitizeQuantity(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.min(Math.round(value * 100) / 100, MAX_QUANTITY);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface RequirementInput {
  quantity: number;
  unit: string;
  notes?: string;
}

/** Adds a product, or updates it when it is already in the list. Returns "added" or "updated". */
export function saveRequirement(product: ProductRef, input: RequirementInput): "added" | "updated" {
  const current = getSnapshot();
  const quantity = sanitizeQuantity(input.quantity);
  const unit = input.unit || product.units[0] || "Pieces";
  const notes = (input.notes ?? "").trim();
  const existing = current.find((item) => item.id === product.id);

  if (existing) {
    commit(current.map((item) => (item.id === product.id ? { ...item, ...product, quantity, unit, notes } : item)));
    return "updated";
  }
  commit([...current, { ...product, quantity, unit, notes, addedAt: Date.now() }]);
  window.dispatchEvent(new CustomEvent(ADDED_EVENT, { detail: product.id }));
  return "added";
}

/** Fired when the visitor adds a new product (not on page load). */
export const ADDED_EVENT = "requirements:added";

/** A number that increases each time the visitor adds a product. */
export function useAddedPulse(): number {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const onAdded = () => setPulse((n) => n + 1);
    window.addEventListener(ADDED_EVENT, onAdded);
    return () => window.removeEventListener(ADDED_EVENT, onAdded);
  }, []);
  return pulse;
}

export function updateRequirement(id: string, patch: Partial<RequirementInput>) {
  commit(
    getSnapshot().map((item) =>
      item.id === id
        ? {
            ...item,
            ...(patch.quantity !== undefined ? { quantity: sanitizeQuantity(patch.quantity) } : {}),
            ...(patch.unit !== undefined ? { unit: patch.unit } : {}),
            ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
          }
        : item,
    ),
  );
}

export function removeRequirement(id: string) {
  commit(getSnapshot().filter((item) => item.id !== id));
}

export function clearRequirements() {
  commit([]);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useRequirements(): RequirementItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useRequirement(id: string): RequirementItem | undefined {
  return useRequirements().find((item) => item.id === id);
}

const noopSubscribe = () => () => {};

/** False during server rendering and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

// ---------------------------------------------------------------------------
// Customer details (remembered on this device for the next enquiry)
// ---------------------------------------------------------------------------

export function loadCustomerDetails(): Partial<CustomerDetails> {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as Partial<CustomerDetails>) : {};
  } catch {
    return {};
  }
}

export function saveCustomerDetails(details: Pick<CustomerDetails, "name" | "phone" | "location">) {
  try {
    window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(details));
  } catch {
    // Not critical.
  }
}

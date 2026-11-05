import type { ProductRef } from "./catalog";

/** One line in "My requirements" (stored in the visitor's browser). */
export interface RequirementItem extends ProductRef {
  quantity: number;
  unit: string;
  notes: string;
  addedAt: number;
}

/** Details collected by the quotation form. */
export interface CustomerDetails {
  name: string;
  phone: string;
  location: string;
  projectDetails: string;
}

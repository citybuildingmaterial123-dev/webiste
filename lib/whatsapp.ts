/**
 * WhatsApp enquiry messages and links.
 *
 * Messages use WhatsApp formatting: *bold*. Links use the official
 * https://wa.me/<number>?text=<url-encoded text> format.
 */
import type { CustomerDetails } from "@/types/requirements";
import { formatAmount } from "./units";

export interface QuoteLine {
  id: string;
  name: string;
  categoryName: string;
  subcategoryName?: string;
  brand?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface QuoteMessageInput {
  storeName: string;
  customer: CustomerDetails;
  items: QuoteLine[];
}

/**
 * Above this many URL-encoded characters the message switches to a compact
 * layout, so very long lists still open reliably on phones.
 */
export const WHATSAPP_TEXT_LIMIT = 6000;

/** Removes control characters and trims; keeps single line breaks. */
function clean(value: string | undefined): string {
  return (value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Indents continuation lines so multi-line notes stay under their item. */
function indent(text: string, spaces = 3): string {
  return text.split("\n").join("\n" + " ".repeat(spaces));
}

export function buildQuoteMessage(input: QuoteMessageInput, { compact = false } = {}): string {
  const { storeName, customer, items } = input;
  const lines: string[] = [];

  lines.push(
    items.length > 0
      ? `Hello ${storeName}, I would like to request a quotation for the following materials:`
      : `Hello ${storeName}, I would like to discuss the materials for my project.`,
  );
  lines.push("");
  lines.push(`*Customer name:* ${clean(customer.name)}`);
  lines.push(`*Phone number:* ${clean(customer.phone)}`);
  lines.push(`*Location:* ${clean(customer.location)}`);

  if (items.length > 0) {
    lines.push("");
    lines.push("*My requirements:*");
    items.forEach((item, index) => {
      lines.push("");
      lines.push(`${index + 1}. *${clean(item.name)}*`);
      const category = item.subcategoryName ? `${item.categoryName} › ${item.subcategoryName}` : item.categoryName;
      lines.push(`   Category: ${category}`);
      if (!compact && item.brand) lines.push(`   Brand: ${clean(item.brand)}`);
      if (!compact) lines.push(`   Code: ${item.id}`);
      lines.push(`   Quantity: ${formatAmount(item.quantity, item.unit)}`);
      const notes = clean(item.notes);
      if (notes) lines.push(`   Notes: ${indent(notes)}`);
    });
  }

  const details = clean(customer.projectDetails);
  if (details) {
    lines.push("");
    lines.push("*Additional project details:*");
    lines.push(details);
  }

  lines.push("");
  lines.push(
    items.length > 0
      ? "Please share the quotation and availability."
      : "Please contact me to discuss the requirements.",
  );
  lines.push("");
  lines.push("Thank you.");
  return lines.join("\n");
}

/** Digits only, no leading "+" or "00", as wa.me expects. */
export function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^00/, "");
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${normalizeWhatsAppNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** The full quotation link, falling back to the compact layout for long lists. */
export function buildQuoteWhatsAppUrl(phone: string, input: QuoteMessageInput): string {
  let message = buildQuoteMessage(input);
  if (encodeURIComponent(message).length > WHATSAPP_TEXT_LIMIT) {
    message = buildQuoteMessage(input, { compact: true });
  }
  return buildWhatsAppUrl(phone, message);
}

export function buildProductQuestionMessage(storeName: string, product: { name: string; id: string }): string {
  return `Hello ${storeName}, I have a question about ${product.name} (code ${product.id}).`;
}

export function buildHelpMessage(storeName: string): string {
  return `Hello ${storeName}, I need help choosing materials for my project.`;
}

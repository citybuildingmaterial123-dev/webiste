import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildQuoteMessage,
  buildQuoteWhatsAppUrl,
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
  WHATSAPP_TEXT_LIMIT,
  type QuoteMessageInput,
} from "@/lib/whatsapp";

const input: QuoteMessageInput = {
  storeName: "Test Store",
  customer: { name: " Ravi ", phone: "98765 43210", location: "Anna Nagar", projectDetails: "2-floor house" },
  items: [
    { id: "PL-1", name: "BWP Plywood 18 mm", categoryName: "Plywoods", subcategoryName: "BWP", quantity: 10, unit: "Sheets", notes: "For kitchen" },
    { id: "HW-2", name: "Butt Hinge", categoryName: "Hardwares", brand: "Acme", quantity: 2.5, unit: "Pairs" },
  ],
};

test("builds the structured quotation message", () => {
  const message = buildQuoteMessage(input);
  assert.match(message, /^Hello Test Store, I would like to request a quotation for the following materials:/);
  assert.match(message, /\*Customer name:\* Ravi\n/);
  assert.match(message, /1\. \*BWP Plywood 18 mm\*\n {3}Category: Plywoods › BWP\n {3}Code: PL-1\n {3}Quantity: 10 Sheets\n {3}Notes: For kitchen/);
  assert.match(message, /2\. \*Butt Hinge\*\n {3}Category: Hardwares\n {3}Brand: Acme\n {3}Code: HW-2\n {3}Quantity: 2\.5 Pairs/);
  assert.match(message, /\*Additional project details:\*\n2-floor house/);
  assert.match(message, /Please share the quotation and availability\.\n\nThank you\.$/);
  assert.doesNotMatch(message, /price:|₹|payment/i);
});

test("builds a general enquiry when the list is empty", () => {
  const message = buildQuoteMessage({ ...input, items: [], customer: { ...input.customer, projectDetails: "" } });
  assert.match(message, /I would like to discuss the materials for my project\./);
  assert.doesNotMatch(message, /My requirements/);
  assert.doesNotMatch(message, /Additional project details/);
});

test("creates an encoded wa.me link with a clean number", () => {
  assert.equal(normalizeWhatsAppNumber("+91 98765-43210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("0091 98765 43210"), "919876543210");
  const url = buildWhatsAppUrl("+91 98765 43210", "Hi & bye?\nLine 2");
  assert.equal(url, "https://wa.me/919876543210?text=Hi%20%26%20bye%3F%0ALine%202");
});

test("switches to the compact layout for very long lists", () => {
  const items = Array.from({ length: 80 }, (_, i) => ({
    id: `CODE-${i}`,
    name: `Product number ${i} with a fairly long descriptive name`,
    categoryName: "Plywoods",
    brand: "Some Brand",
    quantity: 5,
    unit: "Sheets",
  }));
  const url = buildQuoteWhatsAppUrl("919876543210", { ...input, items });
  const text = decodeURIComponent(url.split("?text=")[1]);
  assert.doesNotMatch(text, /Code: /);
  assert.doesNotMatch(text, /Brand: /);
  assert.ok(encodeURIComponent(buildQuoteMessage({ ...input, items })).length > WHATSAPP_TEXT_LIMIT);
});

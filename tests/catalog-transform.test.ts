import assert from "node:assert/strict";
import { test } from "node:test";
import { taxonomy } from "@/data/taxonomy";
import {
  buildCatalog,
  CatalogValidationError,
  normalizeHeader,
  normalizeImageUrl,
  parseSpecifications,
  parseVisibility,
  summarize,
} from "@/lib/catalog-transform";

const HEADER = ["ID", "Category", "Sub Category", "Product Name", "Brand", "Description", "Image URL", "Specifications", "Status", "Thickness (mm)"];

test("normalises header spellings", () => {
  assert.equal(normalizeHeader(" Product Name "), "product_name");
  assert.equal(normalizeHeader("Sub-Category"), "sub_category");
  assert.equal(normalizeHeader("Image URL"), "image_url");
});

test("builds products, matches taxonomy aliases and keeps extra columns", () => {
  const rows = [
    HEADER,
    ["PL-1", "plywood", "bwp grade", "BWP Plywood 18 mm", "", "Waterproof plywood. For kitchens.", "", "Thickness: 18 mm | Size: 8 x 4 ft | Termite resistant", "active", "18"],
    ["", "Electrical", "wires and cables", "House Wire 1.5", "", "", "", "", "", ""],
  ];
  const { products, categories, warnings } = buildCatalog(rows, { taxonomy });

  assert.equal(products.length, 2);
  const ply = products.find((p) => p.id === "PL-1")!;
  assert.equal(ply.categorySlug, "plywood");
  assert.equal(ply.subcategorySlug, "bwp");
  assert.equal(ply.summary, "Waterproof plywood.");
  assert.deepEqual(ply.specifications, [
    { label: "Thickness", value: "18 mm" },
    { label: "Size", value: "8 x 4 ft" },
  ]);
  assert.deepEqual(ply.features, ["Termite resistant"]);
  assert.deepEqual(ply.attributes, [{ label: "Thickness (mm)", value: "18" }]);
  assert.deepEqual(ply.units, ["Sheets", "Pieces"]); // category defaults

  const wire = products.find((p) => p.name === "House Wire 1.5")!;
  assert.equal(wire.id, "house-wire-1-5"); // derived from the name
  assert.equal(wire.subcategorySlug, "wires-cables");

  assert.equal(categories.find((c) => c.slug === "plywood")!.productCount, 1);
  assert.equal(categories.find((c) => c.slug === "plywood")!.subcategories.find((s) => s.slug === "bwp")!.productCount, 1);
  assert.deepEqual(warnings, []);
});

test("skips hidden rows and rows without a name, and warns about unknown values", () => {
  const rows = [
    HEADER,
    ["1", "Doors", "Steel Doors", "Steel Door", "", "", "", "", "draft", ""],
    ["2", "Doors", "Glass Doors", "Glass Door", "", "", "", "", "coming", ""],
    ["3", "Doors", "", "", "", "Orphan description", "", "", "", ""],
    ["4", "Paints", "", "Wall Primer", "", "", "", "", "", ""],
  ];
  const result = buildCatalog(rows, { taxonomy });

  assert.equal(result.hiddenCount, 1);
  assert.deepEqual(result.products.map((p) => p.name), ["Glass Door", "Wall Primer"]);
  assert.equal(result.products[0].subcategorySlug, "glass-doors"); // created automatically
  assert.ok(result.categories.some((c) => c.slug === "paints" && c.productCount === 1));
  assert.ok(result.warnings.some((w) => w.includes('Status "coming"')));
  assert.ok(result.warnings.some((w) => w.includes("Row 4: skipped")));
  assert.ok(result.warnings.some((w) => w.includes('Category "Paints"')));
});

test("makes ids and slugs unique", () => {
  const rows = [
    HEADER,
    ["X", "Doors", "", "Flush Door", "", "", "", "", "", ""],
    ["X", "Doors", "", "Flush Door", "", "", "", "", "", ""],
  ];
  const { products } = buildCatalog(rows, { taxonomy });
  assert.deepEqual(products.map((p) => p.id), ["X", "X-2"]);
  assert.deepEqual(products.map((p) => p.slug), ["flush-door", "flush-door-x-2"]);
});

test("rejects a sheet without the required columns or visible products", () => {
  assert.throws(() => buildCatalog([["name", "brand"], ["A", "B"]], { taxonomy }), CatalogValidationError);
  assert.throws(
    () => buildCatalog([HEADER, ["1", "Doors", "", "Door", "", "", "", "", "hidden", ""]], { taxonomy }),
    /No visible products/,
  );
});

test("converts share links to direct image URLs", () => {
  assert.equal(
    normalizeImageUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing"),
    "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
  );
  assert.equal(
    normalizeImageUrl("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp"),
    "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
  );
  assert.equal(normalizeImageUrl("https://www.dropbox.com/s/abc/photo.jpg?dl=0"), "https://www.dropbox.com/s/abc/photo.jpg?raw=1");
  assert.equal(normalizeImageUrl("/images/products/door.jpg"), "/images/products/door.jpg");
  assert.equal(normalizeImageUrl("not a url"), null);
  assert.equal(normalizeImageUrl("javascript:alert(1)"), null);
});

test("parses visibility and specifications", () => {
  assert.equal(parseVisibility(""), "visible");
  assert.equal(parseVisibility("Hidden"), "hidden");
  assert.equal(parseVisibility("maybe"), "unknown");
  assert.deepEqual(parseSpecifications("- Grade = BWP\n• Made to order"), {
    specs: [{ label: "Grade", value: "BWP" }],
    features: ["Made to order"],
  });
});

test("summarises to the first sentence within the length limit", () => {
  assert.equal(summarize("First sentence. Second one."), "First sentence.");
  const long = summarize("word ".repeat(60), 50);
  assert.ok(long.length <= 50 && long.endsWith("…"));
});

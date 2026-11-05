/**
 * Units of measure. Sheet values like "pcs", "nos", "sqft" or "kgs" are mapped
 * to one consistent label so the requirement form and WhatsApp message read well.
 */
const UNIT_ALIASES: Record<string, string> = {
  pc: "Pieces",
  pcs: "Pieces",
  piece: "Pieces",
  pieces: "Pieces",
  no: "Nos",
  nos: "Nos",
  number: "Nos",
  numbers: "Nos",
  unit: "Units",
  units: "Units",
  sheet: "Sheets",
  sheets: "Sheets",
  ft: "Feet",
  feet: "Feet",
  foot: "Feet",
  rft: "Running ft",
  runningft: "Running ft",
  runningfeet: "Running ft",
  sqft: "Sq. ft",
  sqfeet: "Sq. ft",
  squarefeet: "Sq. ft",
  squarefoot: "Sq. ft",
  sqm: "Sq. m",
  squaremetre: "Sq. m",
  squaremeter: "Sq. m",
  m: "Metres",
  mtr: "Metres",
  mtrs: "Metres",
  metre: "Metres",
  metres: "Metres",
  meter: "Metres",
  meters: "Metres",
  kg: "Kg",
  kgs: "Kg",
  kilogram: "Kg",
  kilograms: "Kg",
  ton: "Tonnes",
  tons: "Tonnes",
  tonne: "Tonnes",
  tonnes: "Tonnes",
  set: "Sets",
  sets: "Sets",
  pair: "Pairs",
  pairs: "Pairs",
  box: "Boxes",
  boxes: "Boxes",
  pack: "Packs",
  packs: "Packs",
  packet: "Packs",
  packets: "Packs",
  roll: "Rolls",
  rolls: "Rolls",
  coil: "Coils",
  coils: "Coils",
  bundle: "Bundles",
  bundles: "Bundles",
  length: "Lengths",
  lengths: "Lengths",
  litre: "Litres",
  litres: "Litres",
  liter: "Litres",
  liters: "Litres",
  ltr: "Litres",
  bag: "Bags",
  bags: "Bags",
};

export function normalizeUnit(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const key = trimmed.toLowerCase().replace(/[^a-z]/g, "");
  if (UNIT_ALIASES[key]) return UNIT_ALIASES[key];
  // Unknown unit: keep it, with a capital first letter.
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** "Sheets, pcs | kg" -> ["Sheets", "Pieces", "Kg"] (deduplicated, order kept). */
export function parseUnitList(raw: string): string[] {
  const units = raw
    .split(/[,|/;]+/)
    .map(normalizeUnit)
    .filter(Boolean);
  return [...new Set(units)];
}

/** Format a quantity for display: 10 -> "10", 2.5 -> "2.5". */
export function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
}

const SINGULAR: Record<string, string> = {
  Pieces: "Piece",
  Sheets: "Sheet",
  Units: "Unit",
  Sets: "Set",
  Pairs: "Pair",
  Boxes: "Box",
  Packs: "Pack",
  Rolls: "Roll",
  Coils: "Coil",
  Bundles: "Bundle",
  Lengths: "Length",
  Metres: "Metre",
  Litres: "Litre",
  Tonnes: "Tonne",
  Bags: "Bag",
  Feet: "Foot",
};

/** "1 Sheet", "12 Sheets", "2.5 Kg". */
export function formatAmount(quantity: number, unit: string): string {
  const label = quantity === 1 ? (SINGULAR[unit] ?? unit) : unit;
  return `${formatQuantity(quantity)} ${label}`;
}

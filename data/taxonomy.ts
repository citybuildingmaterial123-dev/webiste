import type { CategoryIconName } from "@/types/catalog";
import type { PhotoKey } from "./photos";

/**
 * Product categories and subcategories.
 *
 * The Google Sheet's `category` and `subcategory` columns are matched against
 * `name`, `slug` and `aliases` below (case and punctuation are ignored).
 *
 * - A subcategory that appears in the sheet but not here is added automatically
 *   (with a build warning), so the shop owner can add new ones from the sheet.
 * - A category that appears in the sheet but not here is also added, at the end
 *   of the list, without a photo. Add it here to give it copy and a photo.
 * - Order here is the order on the website.
 */

export interface SubcategoryDefinition {
  slug: string;
  name: string;
  aliases?: string[];
  description?: string;
}

export interface CategoryDefinition {
  slug: string;
  name: string;
  aliases: string[];
  /** One or two sentences for category cards (25 words at most). */
  description: string;
  /** Opening copy on the category page and its meta description. */
  intro: string;
  keywords: string[];
  icon: CategoryIconName;
  photo?: PhotoKey;
  /** Units offered when a product row does not list its own. First = default. */
  units: string[];
  subcategories: SubcategoryDefinition[];
}

export const taxonomy: CategoryDefinition[] = [
  {
    slug: "hardware",
    name: "Hardwares",
    aliases: ["hardware", "hardwares", "hardware fittings"],
    description:
      "Hinges, handles, fittings and modular kitchen accessories, plus PVC and fluted wall panels.",
    intro:
      "Hinges, handles, screws and fittings for doors, windows and furniture, modular kitchen accessories, and PVC and fluted panels for walls and ceilings. Tell us the finish and size you need and we will check stock.",
    keywords: ["hardware", "hinges", "handles", "fittings", "modular kitchen accessories", "PVC panels", "fluted panels"],
    icon: "hardware",
    photo: "hardware",
    units: ["Pieces", "Sets", "Pairs", "Boxes"],
    subcategories: [
      { slug: "fittings", name: "Fittings", aliases: ["fitting"] },
      { slug: "hinges", name: "Hinges", aliases: ["hinge"] },
      { slug: "handles", name: "Handles", aliases: ["handle"] },
      { slug: "modular-kitchen", name: "Modular Kitchen", aliases: ["modular kitchen accessories", "kitchen"] },
      { slug: "pvc-panel", name: "PVC Panel", aliases: ["pvc panels", "pvc"] },
      { slug: "fluted-panel", name: "Fluted Panel", aliases: ["fluted panels", "fluted"] },
    ],
  },
  {
    slug: "electricals",
    name: "Electricals",
    aliases: ["electrical", "electricals", "electrical and plumbing", "electricals and plumbing"],
    description: "Wires, cables, switches and MCBs, with plumbing pipes, fittings and water tanks.",
    intro:
      "House wiring cables, switches, MCBs and distribution boards, together with plumbing pipes, fittings and water storage tanks for homes and commercial buildings.",
    keywords: ["electrical materials", "wires and cables", "switches", "MCB", "plumbing", "water tanks"],
    icon: "electricals",
    photo: "electricals",
    units: ["Pieces", "Coils", "Metres", "Units"],
    subcategories: [
      { slug: "plumbing", name: "Plumbing", aliases: ["plumbing materials"] },
      { slug: "tanks", name: "Tanks", aliases: ["tank", "water tanks", "water tank"] },
      { slug: "switches", name: "Switches", aliases: ["switch", "switches and sockets"] },
      { slug: "wires-cables", name: "Wires & Cables", aliases: ["wires", "cables", "wire", "cable", "wires and cables"] },
      { slug: "mcb", name: "MCB", aliases: ["mcbs", "breakers", "mcb and db"] },
    ],
  },
  {
    slug: "plywood",
    name: "Plywoods",
    aliases: ["plywood", "plywoods", "ply", "boards", "plywood and boards"],
    description:
      "MR, BWP and other plywood grades, OSL and BSL boards, MDF, WPC, mica and checked plywood.",
    intro:
      "Plywood in MR and BWP grades, OSL and BSL boards, MDF, green board, WPC boards, decorative mica and checked plywood for furniture, kitchens and interiors. Tell us the grade, thickness and number of sheets.",
    keywords: ["plywood", "MR plywood", "BWP plywood", "MDF board", "WPC board", "mica sheets", "laminates"],
    icon: "plywood",
    photo: "plywood",
    units: ["Sheets", "Pieces"],
    subcategories: [
      { slug: "mr-grade", name: "MR Grade", aliases: ["mr", "mr grade plywood"] },
      { slug: "bmr", name: "BMR" },
      { slug: "bwp", name: "BWP", aliases: ["bwp grade", "bwp plywood", "marine"] },
      { slug: "osl", name: "OSL" },
      { slug: "bsl", name: "BSL" },
      { slug: "mdf", name: "MDF", aliases: ["mdf board"] },
      { slug: "green-board", name: "Green Board", aliases: ["greenboard"] },
      { slug: "wpc", name: "WPC", aliases: ["wpc board"] },
      { slug: "mica", name: "Mica", aliases: ["laminate", "laminates", "mica sheets"] },
      { slug: "checked-plywood", name: "Checked Plywood", aliases: ["checked ply", "chequered plywood"] },
    ],
  },
  {
    slug: "roofing-sheets",
    name: "Roofing Sheets",
    aliases: ["roofing", "roofing sheet", "roof sheets", "roofing sheets"],
    description:
      "PUF panels, tile-profile, linear, GC and JSW sheets for homes, sheds and industrial roofs.",
    intro:
      "Roofing for houses, sheds, warehouses and factories: PUF insulated panels, tile-profile and linear sheets, GC sheets and JSW colour-coated sheets. Share your roof size and we will help you work out the number of sheets.",
    keywords: ["roofing sheets", "PUF panels", "metal roofing", "colour coated sheets", "GC sheets", "tile roofing sheets"],
    icon: "roofing",
    photo: "roofing-sheets",
    units: ["Sheets", "Feet", "Sq. ft"],
    subcategories: [
      { slug: "puf-sheets", name: "PUF Sheets", aliases: ["puf", "puf panels", "puf sheet"] },
      { slug: "tile-model-sheets", name: "Tile Model Sheets", aliases: ["tile model", "tile sheets", "tile profile"] },
      { slug: "linear-sheets", name: "Linear Sheets", aliases: ["linear"] },
      { slug: "gc-sheets", name: "GC Sheets", aliases: ["gc", "gc sheet"] },
      { slug: "jsw-sheets", name: "JSW Sheets", aliases: ["jsw", "jsw sheet"] },
      { slug: "aspetz", name: "Aspetz" },
    ],
  },
  {
    slug: "stainless-steel",
    name: "Stainless Steel",
    aliases: ["ss", "stainless", "stainless steel"],
    description: "SS 304 sheets and material from Jindal, JSS and Rishi for fabrication and interiors.",
    intro:
      "Stainless steel sheets and SS 304 material from Jindal, JSS and Rishi for kitchens, railings, fabrication and interior work. Share the grade, thickness and finish you need.",
    keywords: ["stainless steel", "SS 304", "SS sheets", "Jindal stainless", "stainless steel sheets"],
    icon: "steel",
    photo: "stainless-steel",
    units: ["Sheets", "Kg", "Feet", "Pieces"],
    subcategories: [
      { slug: "jindal", name: "Jindal" },
      { slug: "jss-304", name: "JSS 304", aliases: ["jss"] },
      { slug: "rishi-304", name: "Rishi 304", aliases: ["rishi"] },
      { slug: "ss-sheets", name: "SS Sheets", aliases: ["ss sheet", "stainless sheets"] },
    ],
  },
  {
    slug: "ms-gi-pipes",
    name: "MS & GI Pipe",
    aliases: ["ms and gi pipe", "ms gi pipe", "ms & gi pipes", "pipes", "ms pipes", "gi pipes", "steel pipes"],
    description:
      "MS and GI pipes, APL pipes, MS and GP sheets, and weldmesh for fabrication and structures.",
    intro:
      "Mild steel and galvanised pipes, APL MS and GP pipes, MS and GP sheets and weldmesh for structures, gates, grills, sheds and fabrication work. Tell us the size, thickness and length.",
    keywords: ["MS pipes", "GI pipes", "GP pipes", "steel pipes", "MS sheets", "weldmesh", "APL pipes"],
    icon: "pipes",
    photo: "ms-gi-pipes",
    units: ["Lengths", "Kg", "Feet", "Sheets", "Pieces"],
    subcategories: [
      { slug: "ms-pipe", name: "MS Pipe", aliases: ["ms pipes", "ms"] },
      { slug: "gp-pipe", name: "GP Pipe", aliases: ["gp pipes", "gi pipe", "gi pipes"] },
      { slug: "apl-ms-pipe", name: "APL MS Pipe", aliases: ["apl ms"] },
      { slug: "apl-gp-pipe", name: "APL GP Pipe", aliases: ["apl gp"] },
      { slug: "ms-sheets", name: "MS Sheets", aliases: ["ms sheet"] },
      { slug: "gp-sheets", name: "GP Sheets", aliases: ["gp sheet"] },
      { slug: "weldmesh", name: "Weldmesh", aliases: ["weld mesh", "welded mesh"] },
    ],
  },
  {
    slug: "cladding-sheets",
    name: "Cladding Sheets",
    aliases: ["cladding", "cladding sheet", "facade panels"],
    description: "HPL, ACP and metal panel sheets for building fronts, interiors and signage.",
    intro:
      "HPL, ACP and metal panel sheets for building elevations, shopfronts, interiors and signage, along with WBC. Ask us about colours, finishes and thickness.",
    keywords: ["cladding sheets", "ACP sheets", "HPL sheets", "metal cladding", "facade panels"],
    icon: "cladding",
    photo: "cladding-sheets",
    units: ["Sheets", "Sq. ft"],
    subcategories: [
      { slug: "hpl-sheets", name: "HPL Sheets", aliases: ["hpl"] },
      { slug: "acp-sheets", name: "ACP Sheets", aliases: ["acp"] },
      { slug: "metal-panel-sheets", name: "Metal Panel Sheets", aliases: ["metal panels", "metal panel"] },
      { slug: "wbc", name: "WBC" },
    ],
  },
  {
    slug: "doors",
    name: "Doors",
    aliases: ["door"],
    description: "Wooden, modular, UV and steel doors for homes, offices and commercial buildings.",
    intro:
      "Wooden, modular, UV-finish and steel doors for bedrooms, bathrooms, main entrances and commercial buildings. Share the door sizes and quantity, and we will suggest options that fit.",
    keywords: ["doors", "wooden doors", "flush doors", "steel doors", "UV doors", "modular doors"],
    icon: "doors",
    photo: "doors",
    units: ["Pieces", "Sets"],
    subcategories: [
      { slug: "wooden-doors", name: "Wooden Doors", aliases: ["wooden", "wood doors"] },
      { slug: "modular-doors", name: "Modular Doors", aliases: ["modular"] },
      { slug: "uv-doors", name: "UV Doors", aliases: ["uv"] },
      { slug: "steel-doors", name: "Steel Doors", aliases: ["steel", "metal doors"] },
    ],
  },
];

/** Units offered for categories added from the sheet that are not listed above. */
export const DEFAULT_UNITS = ["Pieces", "Units", "Kg", "Feet"];

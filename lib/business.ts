/**
 * Helpers that turn config/site.ts into display text and links.
 */
import { siteConfig, type OpeningHoursRule } from "@/config/site";
import { buildWhatsAppUrl } from "./whatsapp";

const { address } = siteConfig;

/** ["Main Road, Town Centre", "City, State 600001"] without empty parts. */
export function addressLines(): string[] {
  const line1 = [address.street, address.area].filter(Boolean).join(", ");
  const cityLine = [address.city, [address.state, address.postalCode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [line1, cityLine].filter(Boolean);
}

export function addressOneLine(): string {
  return addressLines().join(", ");
}

/** Short place name for headings: city if set, else the area. */
export function placeName(): string {
  return address.city || address.area;
}

export function mapsUrl(): string {
  if (siteConfig.mapsUrl) return siteConfig.mapsUrl;
  const query = [siteConfig.name, addressOneLine(), address.country].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function phoneHref(): string {
  return `tel:${siteConfig.contact.phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappUrl(message?: string): string {
  return buildWhatsAppUrl(siteConfig.contact.whatsappNumber, message);
}

// ---------------------------------------------------------------------------
// Opening hours
// ---------------------------------------------------------------------------

/** "09:30" -> "9:30 am", "20:00" -> "8 pm" */
export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

export function formatHours(rule: OpeningHoursRule): string {
  return rule.opens && rule.closes ? `${formatTime(rule.opens)} to ${formatTime(rule.closes)}` : "Closed";
}

/** "Open Monday to Saturday, 9:30 am to 8:30 pm" (open days only). */
export function hoursSummary(): string {
  const open = siteConfig.hours.filter((rule) => rule.opens && rule.closes);
  if (open.length === 0) return "";
  return "Open " + open.map((rule) => `${rule.label}, ${formatHours(rule)}`).join("; ");
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Weekday (0-6) and minutes since midnight in the store's time zone. */
export function zonedNow(date: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export interface OpenStatus {
  open: boolean;
  text: string;
  /** Day index (0-6) of "today" in the store's time zone. */
  today: number;
}

/** "Open now, until 8:30 pm" / "Closed, opens Monday at 9:30 am". */
export function getOpenStatus(
  date: Date,
  hours: readonly OpeningHoursRule[] = siteConfig.hours,
  timeZone: string = siteConfig.timeZone,
): OpenStatus {
  const { day, minutes } = zonedNow(date, timeZone);
  const ruleFor = (d: number) => hours.find((rule) => rule.days.includes(d) && rule.opens && rule.closes);

  const today = ruleFor(day);
  if (today && minutes >= toMinutes(today.opens!) && minutes < toMinutes(today.closes!)) {
    return { open: true, text: `Open now, until ${formatTime(today.closes!)}`, today: day };
  }
  if (today && minutes < toMinutes(today.opens!)) {
    return { open: false, text: `Closed, opens today at ${formatTime(today.opens!)}`, today: day };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (day + offset) % 7;
    const rule = ruleFor(next);
    if (rule) {
      const when = offset === 1 ? "tomorrow" : DAY_NAMES[next];
      return { open: false, text: `Closed, opens ${when} at ${formatTime(rule.opens!)}`, today: day };
    }
  }
  return { open: false, text: "Closed", today: day };
}

/** Schema.org day names for structured data. */
export const SCHEMA_DAYS = DAY_NAMES;

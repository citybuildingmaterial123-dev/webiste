import assert from "node:assert/strict";
import { test } from "node:test";
import type { OpeningHoursRule } from "@/config/site";
import { formatTime, getOpenStatus } from "@/lib/business";

const hours: OpeningHoursRule[] = [
  { label: "Monday to Saturday", days: [1, 2, 3, 4, 5, 6], opens: "09:30", closes: "20:30" },
  { label: "Sunday", days: [0] },
];
const TZ = "Asia/Kolkata";
// Helper: a UTC instant for a given India local time (IST = UTC+5:30).
const ist = (iso: string) => new Date(`${iso}+05:30`);

test("formats times", () => {
  assert.equal(formatTime("09:30"), "9:30 am");
  assert.equal(formatTime("20:00"), "8 pm");
  assert.equal(formatTime("12:15"), "12:15 pm");
  assert.equal(formatTime("00:00"), "12 am");
});

test("open during hours, in the store's time zone", () => {
  // Wednesday 4 November 2026, 11:00 in India
  assert.deepEqual(getOpenStatus(ist("2026-11-04T11:00:00"), hours, TZ).text, "Open now, until 8:30 pm");
});

test("closed before opening and after closing", () => {
  assert.equal(getOpenStatus(ist("2026-11-04T08:00:00"), hours, TZ).text, "Closed, opens today at 9:30 am");
  assert.equal(getOpenStatus(ist("2026-11-04T21:00:00"), hours, TZ).text, "Closed, opens tomorrow at 9:30 am");
});

test("skips closed days", () => {
  // Saturday evening -> Sunday closed -> Monday
  assert.equal(getOpenStatus(ist("2026-11-07T21:00:00"), hours, TZ).text, "Closed, opens Monday at 9:30 am");
});

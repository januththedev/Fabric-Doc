import { expect, test } from "vitest";
import { formatDate, formatRelativeTime, slugify } from "@/lib/format";

const now = new Date("2026-11-19T12:00:00Z");

test("formats just now", () => {
  expect(formatRelativeTime("2026-11-19T11:59:30Z", now)).toBe("just now");
});

test("formats minutes", () => {
  expect(formatRelativeTime("2026-11-19T11:15:00Z", now)).toBe("45 minutes ago");
});

test("formats hours", () => {
  expect(formatRelativeTime("2026-11-19T07:00:00Z", now)).toBe("5 hours ago");
});

test("formats yesterday", () => {
  expect(formatRelativeTime("2026-11-18T12:00:00Z", now)).toBe("yesterday");
});

test("formats weeks", () => {
  expect(formatRelativeTime("2026-11-05T12:00:00Z", now)).toBe("2 weeks ago");
});

test("formats months", () => {
  expect(formatRelativeTime("2026-08-19T12:00:00Z", now)).toBe("3 months ago");
});

test("formats years", () => {
  expect(formatRelativeTime("2024-11-19T12:00:00Z", now)).toBe("2 years ago");
});

test("formats a date in Colombo time", () => {
  expect(formatDate("2026-11-19T20:00:00Z")).toBe("20 Nov 2026");
});

test("slugifies a title", () => {
  expect(slugify("Chair & Dining Upholstery")).toBe("chair-dining-upholstery");
  expect(slugify("  Sofa  Deep Cleaning!! ")).toBe("sofa-deep-cleaning");
  expect(slugify("!!!")).toBe("");
});

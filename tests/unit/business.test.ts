import { expect, test } from "vitest";
import { BUSINESS_INFO, DEFAULT_SERVICES, PROCESS_STEPS } from "@/config/business";

test("facebook url is the fixed link", () => {
  expect(BUSINESS_INFO.facebookUrl).toBe("https://www.facebook.com/fabricdoctorlk/");
});

test("default services are the four fabric services in order", () => {
  expect(DEFAULT_SERVICES.map((x) => x.id)).toEqual([
    "sofa-cleaning",
    "mattress-cleaning",
    "chair-cleaning",
    "carpet-cleaning",
  ]);
  expect(DEFAULT_SERVICES.map((x) => x.title)).toEqual([
    "Sofa Deep Cleaning",
    "Mattress Sanitization",
    "Chair & Dining Upholstery",
    "Carpet & Rug Cleaning",
  ]);
});

test("we do not clean cars", () => {
  expect(JSON.stringify([BUSINESS_INFO, DEFAULT_SERVICES])).not.toMatch(/\bcars?\b|vehicle/i);
});

test("process steps have the brief's titles", () => {
  expect(PROCESS_STEPS.map((s) => s.title)).toEqual([
    "Fabric Inspection & Spot Pre-Treatment",
    "Deep Extraction & Anti-Allergen Sanitization",
    "High-Power Moisture Extraction & Fresh Finish",
  ]);
});

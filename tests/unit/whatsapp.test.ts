import { expect, test } from "vitest";
import { buildInquiryMessage, buildServiceMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

test("builds the default WhatsApp url", () => {
  expect(buildWhatsAppUrl()).toBe(
    "https://wa.me/94740594100?text=Hi%20Fabric%20Doctor!%20I%20would%20like%20to%20inquire%20about%20your%20deep%20cleaning%20services.",
  );
});

test("encodes the message", () => {
  expect(buildWhatsAppUrl("A & B #1\nnext")).toBe(
    "https://wa.me/94740594100?text=A%20%26%20B%20%231%0Anext",
  );
});

test("builds a service booking message", () => {
  expect(buildServiceMessage("Mattress Sanitization")).toBe(
    "Hi Fabric Doctor! I'd like to book Mattress Sanitization. Could you share availability and pricing?",
  );
});

test("builds a full inquiry message", () => {
  expect(
    buildInquiryMessage({
      name: "Kasun",
      phone: "+94771234567",
      serviceType: "Chair & Dining Upholstery",
      city: "Kandy",
      message: "Coffee stain on seat cushion",
    }),
  ).toBe(
    [
      "Hi Fabric Doctor! I would like to request a quote.",
      "",
      "Name: Kasun",
      "Phone: +94771234567",
      "Service: Chair & Dining Upholstery",
      "Area: Kandy",
      "Details: Coffee stain on seat cushion",
    ].join("\n"),
  );
});

test("empty message omits the Details line", () => {
  expect(
    buildInquiryMessage({
      name: "Kasun",
      phone: "+94771234567",
      serviceType: "Sofa Deep Cleaning",
      city: "Galle",
      message: "",
    }),
  ).not.toContain("Details:");
});

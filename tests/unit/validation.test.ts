import { expect, test } from "vitest";
import { inquiryInputSchema, reviewInputSchema, serviceInputSchema } from "@/lib/validation";

const base = {
  reviewerName: "  Dilini ",
  serviceType: "Sofa Deep Cleaning",
  rating: 5,
  comment: "Great job on our sofa!",
};

test("trims the reviewer name", () => {
  expect(reviewInputSchema.parse(base).reviewerName).toBe("Dilini");
});

test("defaults the image url to null", () => {
  expect(reviewInputSchema.parse(base).imageUrl).toBeNull();
});

test("rejects a too short comment", () => {
  expect(reviewInputSchema.safeParse({ ...base, comment: "short" }).success).toBe(false);
});

test("rejects out of range and fractional ratings", () => {
  for (const rating of [0, 6, 4.5])
    expect(reviewInputSchema.safeParse({ ...base, rating }).success).toBe(false);
});

test("rejects a blank service type", () => {
  expect(reviewInputSchema.safeParse({ ...base, serviceType: " " }).success).toBe(false);
});

const blobUrl = (folder: "reviews" | "admin") =>
  `https://abc.public.blob.vercel-storage.com/${folder}/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg`;

test("accepts only https review uploads", () => {
  expect(reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("admin") }).success).toBe(false);
  expect(reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("reviews") }).success).toBe(true);
  expect(
    reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("reviews").replace("https", "http") })
      .success,
  ).toBe(false);
});

test("normalises the inquiry phone", () => {
  const inq = inquiryInputSchema.parse({
    name: "Kasun",
    phone: "074 059 4100",
    serviceType: "Sofa Deep Cleaning",
    city: "Kandy",
    message: "",
  });
  expect(inq.phone).toBe("+94740594100");
});

test("rejects an invalid inquiry phone with the exact message", () => {
  const bad = inquiryInputSchema.safeParse({
    name: "Kasun",
    phone: "123",
    serviceType: "Sofa Deep Cleaning",
    city: "Kandy",
  });
  expect(bad.success).toBe(false);
  expect(bad.error!.issues[0].message).toBe("Enter a valid phone number, e.g. 074 059 4100");
});

const svc = {
  title: " Sofa Deep Cleaning ",
  shortDesc: "Deep extraction and stain removal.",
  highlights: ["  Stain & odor removal ", ""],
  imageUrl: null,
};

test("parses a service input with defaults", () => {
  const parsedSvc = serviceInputSchema.parse(svc);
  expect(parsedSvc.title).toBe("Sofa Deep Cleaning");
  expect(parsedSvc.highlights).toEqual(["Stain & odor removal"]);
  expect(parsedSvc.isActive).toBe(true);
  expect(parsedSvc.removeImage).toBe(false);
});

test("rejects a service with too many highlights", () => {
  expect(
    serviceInputSchema.safeParse({ ...svc, highlights: ["a1", "b2", "c3", "d4", "e5", "f6"] }).success,
  ).toBe(false);
});

test("rejects a short title", () => {
  expect(serviceInputSchema.safeParse({ ...svc, title: "x" }).success).toBe(false);
});

test("rejects a short description", () => {
  expect(serviceInputSchema.safeParse({ ...svc, shortDesc: "short" }).success).toBe(false);
});

test("accepts only https admin uploads for services", () => {
  expect(serviceInputSchema.safeParse({ ...svc, imageUrl: blobUrl("reviews") }).success).toBe(false);
  expect(serviceInputSchema.safeParse({ ...svc, imageUrl: blobUrl("admin") }).success).toBe(true);
});

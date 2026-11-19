import { isAllowedImageUrl, isBlobUrl } from "@/lib/blob";

const U = (folder: string, host = "abc.public.blob.vercel-storage.com", scheme = "https") =>
  `${scheme}://${host}/${folder}/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg`;

test("accepts our own uploads in the right folder", () => {
  expect(isAllowedImageUrl(U("reviews"), "reviews")).toBe(true);
  expect(isAllowedImageUrl(U("admin"), "admin")).toBe(true);
});

test("rejects the wrong folder", () => {
  expect(isAllowedImageUrl(U("admin"), "reviews")).toBe(false);
  expect(isAllowedImageUrl(U("reviews"), "admin")).toBe(false);
});

test("rejects other hosts, look-alike hosts and http", () => {
  expect(isAllowedImageUrl(U("reviews", "evil.example.com"), "reviews")).toBe(false);
  expect(isAllowedImageUrl(U("reviews", "abc.public.blob.vercel-storage.com.evil.com"), "reviews")).toBe(false);
  expect(isAllowedImageUrl(U("reviews", undefined, "http"), "reviews")).toBe(false);
});

test("rejects traversal and garbage", () => {
  expect(isAllowedImageUrl("https://abc.public.blob.vercel-storage.com/reviews/../admin/x.jpg", "reviews")).toBe(false);
  expect(isAllowedImageUrl("not a url", "reviews")).toBe(false);
});

test("isBlobUrl only matches Vercel Blob hosts", () => {
  expect(isBlobUrl(U("reviews"))).toBe(true);
  expect(isBlobUrl("https://images.unsplash.com/photo-1")).toBe(false);
});

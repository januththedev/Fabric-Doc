import { revalidatePath } from "next/cache";
import { submitReview } from "@/server/actions/reviews";
import { getClientIp } from "@/server/ip";
import { getServices } from "@/server/queries";
import { takeRateLimit } from "@/server/rate-limit";
import { createReviewWithMoment } from "@/server/repo";
import { fakeMoment, fakeReview, fakeService } from "./fixtures";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/repo");
vi.mock("@/server/queries");
vi.mock("@/server/rate-limit");
vi.mock("@/server/ip");

const valid = {
  reviewerName: "Dilini",
  serviceType: "Sofa Deep Cleaning",
  rating: 5,
  comment: "Great job on our sofa!",
  imageUrl: null,
};
const BLOB = "https://abc.public.blob.vercel-storage.com/reviews/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
  vi.mocked(getServices).mockResolvedValue([fakeService({ title: "Sofa Deep Cleaning" })]);
  vi.mocked(takeRateLimit).mockResolvedValue(true);
  vi.mocked(getClientIp).mockResolvedValue("1.1.1.1");
  vi.mocked(createReviewWithMoment).mockResolvedValue({ review: fakeReview(), moment: null });
});
afterEach(() => vi.unstubAllEnvs());

test("honeypot filled → generic error, repo not called", async () => {
  const res = await submitReview({ ...valid, website: "http://spam.example" });
  expect(res).toEqual({ ok: false, error: "Something went wrong. Please try again." });
  expect(createReviewWithMoment).not.toHaveBeenCalled();
});

test("demo mode → demo error", async () => {
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");
  expect(await submitReview(valid)).toEqual({ ok: false, error: "Demo mode: connect a database to save reviews." });
});

test("not configured → unavailable", async () => {
  vi.stubEnv("DATABASE_URL", "");
  expect(await submitReview(valid)).toEqual({ ok: false, error: "Reviews are temporarily unavailable." });
});

test("invalid input → field error result", async () => {
  expect(await submitReview({ ...valid, comment: "short" })).toEqual({
    ok: false,
    error: "Please check the highlighted fields.",
  });
});

test("unknown service title → error", async () => {
  expect(await submitReview({ ...valid, serviceType: "Pool Cleaning" })).toEqual({
    ok: false,
    error: "Please choose a service.",
  });
  expect(createReviewWithMoment).not.toHaveBeenCalled();
});

test("a photo URL on a foreign host is refused", async () => {
  const foreign = BLOB.replace("abc.public.blob.vercel-storage.com", "evil.example.com");
  expect(await submitReview({ ...valid, imageUrl: foreign })).toEqual({
    ok: false,
    error: "That photo could not be verified. Please upload it again.",
  });
  expect(createReviewWithMoment).not.toHaveBeenCalled();
});

test("a photo from the admin folder is refused by the schema", async () => {
  const res = await submitReview({ ...valid, imageUrl: BLOB.replace("/reviews/", "/admin/") });
  expect(res).toEqual({ ok: false, error: "Please check the highlighted fields." });
  expect(createReviewWithMoment).not.toHaveBeenCalled();
});

test("rate limited → friendly error", async () => {
  vi.mocked(takeRateLimit).mockResolvedValue(false);
  expect(await submitReview(valid)).toEqual({
    ok: false,
    error: "You've posted a few reviews recently. Please try again in a while.",
  });
  expect(takeRateLimit).toHaveBeenCalledWith("review", "1.1.1.1", { max: 3, windowSeconds: 3600 });
});

test("valid → repo called with the payload and pages revalidated", async () => {
  const moment = fakeMoment();
  vi.mocked(createReviewWithMoment).mockResolvedValue({ review: fakeReview(), moment });
  const res = await submitReview({ ...valid, imageUrl: BLOB });
  expect(createReviewWithMoment).toHaveBeenCalledWith({
    reviewerName: "Dilini",
    serviceType: "Sofa Deep Cleaning",
    rating: 5,
    comment: "Great job on our sofa!",
    imageUrl: BLOB,
  });
  expect(revalidatePath).toHaveBeenCalledWith("/");
  expect(revalidatePath).toHaveBeenCalledWith("/reviews");
  expect(res).toEqual({ ok: true, data: { review: fakeReview(), moment } });
});

test("repo throws → generic error and the failure is logged", async () => {
  vi.mocked(createReviewWithMoment).mockRejectedValue(new Error("db down"));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(await submitReview(valid)).toEqual({ ok: false, error: "Something went wrong. Please try again." });
  expect(spy).toHaveBeenCalled();
});

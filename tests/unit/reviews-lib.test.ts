import { pickFeaturedReviews, splitReviews } from "@/lib/reviews";
import { fakeReview } from "./fixtures";

const six = Array.from({ length: 6 }, (_, i) => fakeReview({ id: `r${i}` }));

test("splitReviews puts the first four above the Moments gallery", () => {
  const { lead, rest } = splitReviews(six);
  expect(lead.map((r) => r.id)).toEqual(["r0", "r1", "r2", "r3"]);
  expect(rest.map((r) => r.id)).toEqual(["r4", "r5"]);
});

test("splitReviews with fewer reviews than the lead count has no rest", () => {
  expect(splitReviews(six.slice(0, 2))).toEqual({ lead: six.slice(0, 2), rest: [] });
  expect(splitReviews([])).toEqual({ lead: [], rest: [] });
});

test("pickFeaturedReviews keeps five-star reviews, newest first", () => {
  const picked = pickFeaturedReviews([
    fakeReview({ id: "a", rating: 4, createdAt: "2026-11-18T00:00:00.000Z" }),
    fakeReview({ id: "b", rating: 5, createdAt: "2026-11-10T00:00:00.000Z" }),
    fakeReview({ id: "c", rating: 5, createdAt: "2026-11-17T00:00:00.000Z" }),
  ]);
  expect(picked.map((r) => r.id)).toEqual(["c", "b"]);
});

test("pickFeaturedReviews respects the count", () => {
  expect(pickFeaturedReviews(six, 2)).toHaveLength(2);
});

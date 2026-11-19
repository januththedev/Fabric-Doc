import { getPool } from "@/db/client";
import { createReviewWithMoment } from "@/server/repo";

// Runs the REAL repo against the dedicated local test database.
const q = (text: string, values: unknown[] = []) => getPool().query(text, values);

beforeEach(async () => {
  await q("truncate reviews, moments cascade");
});
afterAll(async () => {
  await getPool().end();
});

const input = {
  reviewerName: "Dilini",
  serviceType: "Sofa Deep Cleaning",
  rating: 5,
  comment: "Spotless sofa, thank you!",
};
const PHOTO = "https://abc.public.blob.vercel-storage.com/reviews/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";

test("a review with a photo creates a linked Moment", async () => {
  const { review, moment } = await createReviewWithMoment({ ...input, imageUrl: PHOTO });
  expect(review.imageSrc).toBe(PHOTO);
  expect(moment).toMatchObject({ sourceType: "review", reviewId: review.id, reviewerName: "Dilini", imageSrc: PHOTO });
  const { rows } = await q("select count(*)::int as n from moments");
  expect(rows[0].n).toBe(1);
});

test("a review without a photo creates no Moment", async () => {
  const { review, moment } = await createReviewWithMoment({ ...input, imageUrl: null });
  expect(moment).toBeNull();
  expect(review.imageSrc).toBeNull();
  const { rows } = await q("select count(*)::int as n from moments");
  expect(rows[0].n).toBe(0);
});

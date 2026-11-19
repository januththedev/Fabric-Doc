import { getPool } from "@/db/client";
import {
  createInquiry,
  createReviewWithMoment,
  deleteInquiryById,
  deleteMomentById,
  deleteReviewById,
  insertAdminMoments,
} from "@/server/repo";

// Runs the REAL repo against the dedicated local test database (see vitest.db.config.mts).
const q = (text: string, values: unknown[] = []) => getPool().query(text, values);

beforeAll(() => vi.stubEnv("DATABASE_URL", process.env.DATABASE_URL ?? ""));
beforeEach(async () => {
  await q("truncate reviews, moments, inquiries restart identity cascade");
});
afterAll(async () => {
  await getPool().end();
});

const UUID = "0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b";
const REVIEW_PHOTO = `https://abc.public.blob.vercel-storage.com/reviews/${UUID}.jpg`;
const ADMIN_PHOTO = `https://abc.public.blob.vercel-storage.com/admin/${UUID}.jpg`;

const input = {
  reviewerName: "Dilini",
  serviceType: "Sofa Deep Cleaning",
  rating: 5,
  comment: "Spotless sofa, thank you!",
};

test("deleting a review returns its image url and removes its moment", async () => {
  const { review } = await createReviewWithMoment({ ...input, imageUrl: REVIEW_PHOTO });

  expect(await deleteReviewById(review.id)).toEqual({ imageUrl: REVIEW_PHOTO });
  expect((await q("select count(*)::int as n from reviews")).rows[0].n).toBe(0);
  expect((await q("select count(*)::int as n from moments")).rows[0].n).toBe(0);
});

test("deleting an unknown review returns null", async () => {
  expect(await deleteReviewById("11111111-1111-4111-8111-111111111111")).toBeNull();
});

test("deleting a review-sourced moment nulls the review's image_url", async () => {
  const { review, moment } = await createReviewWithMoment({ ...input, imageUrl: REVIEW_PHOTO });

  expect(await deleteMomentById(moment!.id)).toEqual({ imageUrl: REVIEW_PHOTO });

  const { rows } = await q("select image_url from reviews where id = $1", [review.id]);
  expect(rows[0].image_url).toBeNull();
  expect((await q("select count(*)::int as n from moments")).rows[0].n).toBe(0);
});

test("insertAdminMoments creates admin moments", async () => {
  const moments = await insertAdminMoments([{ imageUrl: ADMIN_PHOTO, caption: "Fresh sofa" }]);

  expect(moments).toHaveLength(1);
  expect(moments[0]).toMatchObject({
    imageSrc: ADMIN_PHOTO,
    caption: "Fresh sofa",
    sourceType: "admin",
    reviewerName: null,
    reviewId: null,
  });
});

test("deleteInquiryById returns true then false", async () => {
  await createInquiry({
    name: "Kasun",
    phone: "+94771234567",
    serviceType: "Sofa Deep Cleaning",
    city: "Kandy",
    message: "Coffee stain on seat cushion",
  });
  const { rows } = await q("select id from inquiries");
  const id = rows[0].id as string;

  expect(await deleteInquiryById(id)).toBe(true);
  expect(await deleteInquiryById(id)).toBe(false);
});

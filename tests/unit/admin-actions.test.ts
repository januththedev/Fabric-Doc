// @vitest-environment node
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { deleteBlobIfOwned } from "@/server/blob";
import { deleteInquiryById, deleteMomentById, deleteReviewById, insertAdminMoments } from "@/server/repo";
import { createAdminMoments, deleteInquiry, deleteMoment, deleteReview } from "@/server/actions/admin";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/server/repo");
vi.mock("@/server/blob");

const UUID = "0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b";
const REVIEW_BLOB = `https://abc.public.blob.vercel-storage.com/reviews/${UUID}.jpg`;
const ADMIN_BLOB = `https://abc.public.blob.vercel-storage.com/admin/${UUID}.jpg`;

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({ email: "owner@test.local" });
  vi.mocked(deleteBlobIfOwned).mockResolvedValue(undefined);
});

test("deleteReview deletes the row, then its blob", async () => {
  vi.mocked(deleteReviewById).mockResolvedValue({ imageUrl: REVIEW_BLOB });

  expect(await deleteReview("review-1")).toEqual({ ok: true, data: undefined });
  expect(deleteReviewById).toHaveBeenCalledWith("review-1");
  expect(deleteBlobIfOwned).toHaveBeenCalledWith(REVIEW_BLOB);
  expect(revalidatePath).toHaveBeenCalledWith("/");
  expect(revalidatePath).toHaveBeenCalledWith("/reviews");
  expect(revalidatePath).toHaveBeenCalledWith("/admin");
});

test("deleteReview with no image deletes no blob", async () => {
  vi.mocked(deleteReviewById).mockResolvedValue({ imageUrl: null });

  expect(await deleteReview("review-1")).toEqual({ ok: true, data: undefined });
  expect(deleteBlobIfOwned).not.toHaveBeenCalled();
});

test("deleteMoment deletes via the repo, then the blob", async () => {
  vi.mocked(deleteMomentById).mockResolvedValue({ imageUrl: ADMIN_BLOB });

  expect(await deleteMoment("moment-1")).toEqual({ ok: true, data: undefined });
  expect(deleteMomentById).toHaveBeenCalledWith("moment-1");
  expect(deleteBlobIfOwned).toHaveBeenCalledWith(ADMIN_BLOB);
});

test("createAdminMoments accepts admin photos and revalidates", async () => {
  vi.mocked(insertAdminMoments).mockResolvedValue([]);

  expect(await createAdminMoments([{ imageUrl: ADMIN_BLOB, caption: "Fresh sofa" }])).toEqual({ ok: true, data: [] });
  expect(insertAdminMoments).toHaveBeenCalledWith([{ imageUrl: ADMIN_BLOB, caption: "Fresh sofa" }]);
  expect(revalidatePath).toHaveBeenCalledWith("/");
});

test("createAdminMoments rejects a reviews/ url or a foreign host", async () => {
  expect(await createAdminMoments([{ imageUrl: REVIEW_BLOB, caption: null }])).toEqual({
    ok: false,
    error: "Please check the highlighted fields.",
  });
  expect(
    await createAdminMoments([{ imageUrl: `https://evil.example/admin/${UUID}.jpg`, caption: null }]),
  ).toEqual({ ok: false, error: "That photo could not be verified. Please upload it again." });
  expect(insertAdminMoments).not.toHaveBeenCalled();
});

test("deleteInquiry deletes through the repo", async () => {
  vi.mocked(deleteInquiryById).mockResolvedValue(true);

  expect(await deleteInquiry("inquiry-1")).toEqual({ ok: true, data: undefined });
  expect(deleteInquiryById).toHaveBeenCalledWith("inquiry-1");
});

test("every admin action stops when requireAdmin rejects", async () => {
  vi.mocked(requireAdmin).mockRejectedValue(new Error("NEXT_REDIRECT"));

  await expect(deleteReview("review-1")).rejects.toThrow("NEXT_REDIRECT");
  await expect(deleteMoment("moment-1")).rejects.toThrow("NEXT_REDIRECT");
  await expect(createAdminMoments([{ imageUrl: ADMIN_BLOB, caption: null }])).rejects.toThrow("NEXT_REDIRECT");
  await expect(deleteInquiry("inquiry-1")).rejects.toThrow("NEXT_REDIRECT");

  expect(deleteReviewById).not.toHaveBeenCalled();
  expect(deleteMomentById).not.toHaveBeenCalled();
  expect(insertAdminMoments).not.toHaveBeenCalled();
  expect(deleteInquiryById).not.toHaveBeenCalled();
});

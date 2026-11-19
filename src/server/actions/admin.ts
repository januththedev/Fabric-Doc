"use server";

import { revalidatePath } from "next/cache";
import { isAllowedImageUrl } from "@/lib/blob";
import type { ActionResult, Moment } from "@/lib/types";
import { adminMomentInputSchema, type AdminMomentInput } from "@/lib/validation";
import { requireAdmin } from "@/server/auth";
import { deleteBlobIfOwned } from "@/server/blob";
import { deleteInquiryById, deleteMomentById, deleteReviewById, insertAdminMoments } from "@/server/repo";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NOT_FOUND_ERROR = "That item no longer exists.";
const INVALID_ERROR = "Please check the highlighted fields.";
const IMAGE_ERROR = "That photo could not be verified. Please upload it again.";

function revalidatePublicContent() {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin");
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await deleteReviewById(id);
    if (!deleted) return { ok: false, error: NOT_FOUND_ERROR };
    // Blob cleanup never turns a successful delete into an error.
    if (deleted.imageUrl) await deleteBlobIfOwned(deleted.imageUrl);
    revalidatePublicContent();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteReview] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function deleteMoment(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await deleteMomentById(id);
    if (!deleted) return { ok: false, error: NOT_FOUND_ERROR };
    if (deleted.imageUrl) await deleteBlobIfOwned(deleted.imageUrl);
    revalidatePublicContent();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteMoment] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function createAdminMoments(items: AdminMomentInput[]): Promise<ActionResult<Moment[]>> {
  await requireAdmin();
  try {
    const validated: { imageUrl: string; caption: string | null }[] = [];
    for (const item of items) {
      const parsed = adminMomentInputSchema.safeParse(item);
      if (!parsed.success) return { ok: false, error: INVALID_ERROR };
      if (!isAllowedImageUrl(parsed.data.imageUrl, "admin")) return { ok: false, error: IMAGE_ERROR };
      validated.push({ imageUrl: parsed.data.imageUrl, caption: parsed.data.caption ?? null });
    }

    const moments = await insertAdminMoments(validated);
    revalidatePublicContent();
    return { ok: true, data: moments };
  } catch (error) {
    console.error("[createAdminMoments] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const deleted = await deleteInquiryById(id);
    if (!deleted) return { ok: false, error: NOT_FOUND_ERROR };
    revalidatePublicContent();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteInquiry] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

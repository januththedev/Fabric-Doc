"use server";

import { revalidatePath } from "next/cache";
import { isAllowedImageUrl } from "@/lib/blob";
import { isDbConfigured, isDemoMode } from "@/lib/env";
import type { ActionResult, Moment, Review } from "@/lib/types";
import { reviewInputSchema, type ReviewFormValues } from "@/lib/validation";
import { getClientIp } from "@/server/ip";
import { getServices } from "@/server/queries";
import { takeRateLimit } from "@/server/rate-limit";
import { createReviewWithMoment } from "@/server/repo";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function submitReview(
  values: ReviewFormValues,
): Promise<ActionResult<{ review: Review; moment: Moment | null }>> {
  // Bots fill every field, including the hidden one.
  if (values.website) return { ok: false, error: GENERIC_ERROR };
  if (isDemoMode()) return { ok: false, error: "Demo mode: connect a database to save reviews." };
  if (!isDbConfigured()) return { ok: false, error: "Reviews are temporarily unavailable." };

  const parsed = reviewInputSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };
  const input = parsed.data;

  const services = await getServices();
  if (!services.some((s) => s.title === input.serviceType)) {
    return { ok: false, error: "Please choose a service." };
  }

  if (input.imageUrl && !isAllowedImageUrl(input.imageUrl, "reviews")) {
    return { ok: false, error: "That photo could not be verified. Please upload it again." };
  }

  const allowed = await takeRateLimit("review", await getClientIp(), { max: 3, windowSeconds: 3600 });
  if (!allowed) {
    return { ok: false, error: "You've posted a few reviews recently. Please try again in a while." };
  }

  try {
    const data = await createReviewWithMoment({
      reviewerName: input.reviewerName,
      serviceType: input.serviceType,
      rating: input.rating,
      comment: input.comment,
      imageUrl: input.imageUrl,
    });
    revalidatePath("/");
    revalidatePath("/reviews");
    return { ok: true, data };
  } catch (error) {
    console.error("[submitReview] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

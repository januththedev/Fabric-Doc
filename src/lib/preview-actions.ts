import type { ActionResult, Moment, Review } from "@/lib/types";
import type { InquiryFormValues, ReviewFormValues } from "@/lib/validation";

/**
 * Preview build: forms behave as they will on the live site, but nothing is sent or stored.
 * A submitted review appears on the page for this visit only.
 */
const pause = () => new Promise((resolve) => setTimeout(resolve, 600));

export async function submitInquiry(values: InquiryFormValues): Promise<ActionResult> {
  void values;
  await pause();
  return { ok: true, data: undefined };
}

export async function submitReview(
  values: ReviewFormValues & { imageUrl?: string | null },
): Promise<ActionResult<{ review: Review; moment: Moment | null }>> {
  await pause();
  const now = new Date().toISOString();
  const review: Review = {
    id: crypto.randomUUID(),
    reviewerName: values.reviewerName.trim(),
    serviceType: values.serviceType,
    rating: values.rating ?? 5,
    comment: values.comment.trim(),
    imageSrc: values.imageUrl ?? null,
    createdAt: now,
  };
  const moment: Moment | null = review.imageSrc
    ? {
        id: crypto.randomUUID(),
        imageSrc: review.imageSrc,
        caption: null,
        sourceType: "review",
        reviewerName: review.reviewerName,
        reviewId: review.id,
        createdAt: now,
      }
    : null;
  return { ok: true, data: { review, moment } };
}

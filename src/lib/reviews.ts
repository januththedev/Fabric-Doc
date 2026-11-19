import { REVIEW_LEAD_COUNT } from "@/config/constants";
import type { Review } from "@/lib/types";

/** Splits a newest-first list into the reviews shown above the Moments gallery and the rest below it. */
export function splitReviews(reviews: Review[], leadCount: number = REVIEW_LEAD_COUNT): { lead: Review[]; rest: Review[] } {
  return { lead: reviews.slice(0, leadCount), rest: reviews.slice(leadCount) };
}

/** The best reviews for the home page: five stars only, newest first. */
export function pickFeaturedReviews(reviews: Review[], count = 3): Review[] {
  return reviews
    .filter((r) => r.rating === 5)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count);
}

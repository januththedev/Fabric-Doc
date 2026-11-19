import { Quote } from "lucide-react";
import { StarRating } from "@/components/shared/star-rating";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

function ReviewChip({ review, hidden }: { review: Review; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      data-testid={hidden ? undefined : "marquee-review"}
      className="flex w-[19rem] shrink-0 flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:w-[23rem]"
    >
      <div className="flex items-center justify-between">
        <StarRating value={review.rating} size="sm" />
        <Quote className="size-5 text-brand" aria-hidden="true" />
      </div>
      <blockquote className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-700">{review.comment}</blockquote>
      <figcaption className="mt-5 border-t border-slate-100 pt-4">
        <p className="font-semibold text-ink">{review.reviewerName}</p>
        <p className="text-xs text-slate-600">{review.serviceType}</p>
      </figcaption>
    </figure>
  );
}

/**
 * Two rows of real reviews drifting in opposite directions. Pauses on hover; with reduced motion it becomes
 * a plain scrollable row. The second copy of each row only exists for the seamless loop and is hidden from
 * screen readers.
 */
export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const half = Math.ceil(reviews.length / 2);
  const rows = reviews.length >= 4 ? [reviews.slice(0, half), reviews.slice(half)] : [reviews];

  return (
    <div className="space-y-5 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="group flex overflow-hidden motion-reduce:overflow-x-auto">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={cn(
                "flex shrink-0 gap-5 pr-5 group-hover:[animation-play-state:paused] motion-reduce:animate-none",
                r % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse",
                copy === 1 && "motion-reduce:hidden",
              )}
            >
              {row.map((review) => (
                <ReviewChip key={`${copy}-${review.id}`} review={review} hidden={copy === 1} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

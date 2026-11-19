"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/reviews/review-form";
import { MomentsGallery } from "@/components/reviews/moments-gallery";
import { MoreReviews } from "@/components/reviews/more-reviews";
import { ReviewCard } from "@/components/reviews/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { splitReviews } from "@/lib/reviews";
import type { Moment, Review, Service } from "@/lib/types";

/**
 * Owns the page's scroll order, which must never change:
 *   form -> lead reviews (first 4) -> Moments gallery -> "More Customer Reviews".
 * It also owns the lists, so a freshly submitted review appears at once (Task 7 calls handleSubmitted).
 */
export function ReviewsExperience({
  initialReviews,
  initialMoments,
  services = [],
}: {
  initialReviews: Review[];
  initialMoments: Moment[];
  services?: readonly Pick<Service, "title">[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [moments, setMoments] = useState(initialMoments);
  const { lead, rest } = splitReviews(reviews);

  const handleSubmitted = (review: Review, moment: Moment | null) => {
    setReviews((prev) => [review, ...prev]);
    if (moment) setMoments((prev) => [moment, ...prev]);
    // Bring the new review into view once it has rendered.
    requestAnimationFrame(() =>
      document.getElementById(`review-${review.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };

  return (
    <>
      <section data-testid="review-form-section" className="bg-white pb-16 pt-4 md:pb-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">Leave a Review</h2>
            <p className="mt-2 text-slate-600">No account needed — it takes less than a minute.</p>
            <ReviewForm services={services} onSubmitted={handleSubmitted} />
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="container-x">
          {lead.length === 0 ? (
            <p className="mx-auto max-w-xl rounded-2xl bg-surface p-8 text-center text-slate-600">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {lead.map((r) => (
                <div key={r.id} id={`review-${r.id}`} data-testid="lead-review">
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="moments" className="bg-ink py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            eyebrow="Gallery"
            title="Moments"
            description="Real before-and-after results & transformations shared by our customers and team."
          />
          <div className="mt-12">
            {moments.length === 0 ? (
              <p className="rounded-2xl bg-white/5 p-8 text-center text-slate-300">
                No moments yet — be the first to share a photo with your review.
              </p>
            ) : (
              <MomentsGallery moments={moments} />
            )}
          </div>
        </div>
      </section>

      {rest.length > 0 ? <MoreReviews reviews={rest} /> : null}
    </>
  );
}

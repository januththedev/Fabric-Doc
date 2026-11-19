"use client";

import { useState } from "react";
import { MORE_REVIEWS_PAGE_SIZE } from "@/config/constants";
import { ReviewCard } from "@/components/reviews/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Review } from "@/lib/types";

/** Everything beyond the lead reviews. Always rendered BELOW the Moments gallery, six at a time. */
export function MoreReviews({ reviews }: { reviews: Review[] }) {
  const [visible, setVisible] = useState(MORE_REVIEWS_PAGE_SIZE);
  const shown = reviews.slice(0, visible);

  return (
    <section data-testid="more-reviews" className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="More stories" title="More Customer Reviews" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
        {visible < reviews.length ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + MORE_REVIEWS_PAGE_SIZE)}
              className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-7 font-semibold text-ink transition duration-200 hover:-translate-y-px hover:border-brand-strong hover:text-brand-strong active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
            >
              Show More Reviews
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

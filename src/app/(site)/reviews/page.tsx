import type { Metadata } from "next";
import { ReviewsExperience } from "@/components/reviews/reviews-experience";
import { StarRating } from "@/components/shared/star-rating";
import { BUSINESS_INFO } from "@/config/business";
import { getMoments, getReviews, getServices } from "@/server/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Reviews & Moments",
  description:
    "Read honest reviews and see real before-and-after results from Fabric Doctor customers, then share your own experience.",
};

export default async function ReviewsPage() {
  const [reviews, moments, services] = await Promise.all([getReviews(), getMoments(), getServices()]);
  const { stats } = BUSINESS_INFO;

  return (
    <>
      <section className="bg-white pb-10 pt-32 sm:pt-40">
        <div className="container-x">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Reviews &amp; Moments
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Honest words and real results from Fabric Doctor customers.
          </p>
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-700">
            <StarRating value={5} size="sm" />
            <span>{stats.recommendationRate} recommend</span>
            <span aria-hidden="true">·</span>
            <span>{stats.reviewCount} reviews</span>
          </p>
        </div>
      </section>
      <ReviewsExperience initialReviews={reviews} initialMoments={moments} services={services} />
    </>
  );
}

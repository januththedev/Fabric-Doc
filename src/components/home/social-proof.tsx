import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { BUSINESS_INFO } from "@/config/business";
import { pickFeaturedReviews } from "@/lib/reviews";
import type { Moment, Review } from "@/lib/types";

export function SocialProof({ reviews, moments }: { reviews: Review[]; moments: Moment[] }) {
  const featured = pickFeaturedReviews(reviews, 3);
  const strip = moments.slice(0, 4);
  const { stats } = BUSINESS_INFO;

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer Love"
          title={
            <>
              Trusted by families who <Accent>care</Accent> about clean
            </>
          }
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
          <div>
            <p className="font-display text-7xl font-semibold leading-none tracking-tight text-brand-strong sm:text-8xl">
              {stats.recommendationRate}
            </p>
            <p className="mt-3 text-lg font-medium text-ink">of customers recommend {BUSINESS_INFO.brandName}</p>
            <StarRating value={5} className="mt-4" />
            <p className="mt-3 text-sm text-slate-600">Based on {stats.reviewCount} reviews on Facebook</p>
          </div>

          {featured.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {featured.map((r) => (
                <figure
                  key={r.id}
                  data-testid="featured-review"
                  className="flex flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5"
                >
                  <Quote className="size-6 text-brand" aria-hidden="true" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{r.comment}</blockquote>
                  <figcaption className="mt-5">
                    <StarRating value={r.rating} size="sm" />
                    <p className="mt-2 font-semibold text-ink">{r.reviewerName}</p>
                    <p className="text-xs text-slate-500">{r.serviceType}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>

        {strip.length > 0 ? (
          <div data-testid="moments-strip" className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {strip.map((m) => (
              <Link
                key={m.id}
                href="/reviews#moments"
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
              >
                <Image
                  src={m.imageSrc}
                  alt={m.caption ?? (m.reviewerName ? `Photo shared by ${m.reviewerName}` : "Fabric Doctor transformation")}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-8">
          <Link
            href="/reviews#moments"
            className="relative inline-block font-semibold text-brand-strong after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
          >
            Explore All Moments &amp; Leave a Review →
          </Link>
        </div>
      </div>
    </section>
  );
}

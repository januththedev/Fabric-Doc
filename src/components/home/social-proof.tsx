import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StarRating } from "@/components/shared/star-rating";
import { BUSINESS_INFO } from "@/config/business";
import type { Moment, Review } from "@/lib/types";

/** Reviews: the numbers are the headline, one review featured large, the rest in a quiet grid, then customer photos. */
export function SocialProof({ reviews, moments }: { reviews: Review[]; moments: Moment[] }) {
  const { stats } = BUSINESS_INFO;
  const [featured, ...rest] = reviews;
  const others = rest.slice(0, 4);
  const strip = moments.slice(0, 4);

  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 className="max-w-3xl font-display text-4xl font-extrabold leading-[0.98] text-ink sm:text-5xl lg:text-6xl">
            {stats.recommendationRate} of our customers recommend us.
          </h2>
          <p className="max-w-sm text-lg leading-relaxed text-slate-600">
            {stats.reviewCount} reviews on Facebook and a community of {stats.followers} people. A few of them, in their own words:
          </p>
        </div>

        {featured ? (
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
            <figure data-testid="marquee-review" className="flex flex-col justify-between rounded-2xl bg-ink p-8 text-white sm:p-10">
              <div>
                <StarRating value={featured.rating} size="md" className="text-sun" />
                <blockquote className="mt-6 font-display text-2xl font-bold leading-snug sm:text-3xl">
                  &ldquo;{featured.comment}&rdquo;
                </blockquote>
              </div>
              <figcaption className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
                <span className="grid size-11 place-items-center rounded-full bg-sun font-bold text-night">
                  {featured.reviewerName.charAt(0)}
                </span>
                <span>
                  <span className="block font-bold">{featured.reviewerName}</span>
                  <span className="block text-sm text-slate-400">{featured.serviceType}</span>
                </span>
              </figcaption>
            </figure>

            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((r) => (
                <figure
                  key={r.id}
                  data-testid="marquee-review"
                  className="flex flex-col rounded-2xl bg-surface p-6 transition duration-300 hover:-translate-y-0.5"
                >
                  <StarRating value={r.rating} size="sm" />
                  <blockquote className="mt-4 line-clamp-5 flex-1 leading-relaxed text-slate-700">{r.comment}</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-bold text-ink">{r.reviewerName}</span>
                    <span className="text-slate-500"> · {r.serviceType}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        {strip.length > 0 ? (
          <div data-testid="moments-strip" className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {strip.map((m, i) => (
              <Link
                key={m.id}
                href="/reviews#moments"
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
              >
                <Image
                  src={m.imageSrc}
                  alt={m.caption ?? `Cleaning result photo ${i + 1} from Fabric Doctor`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </Link>
            ))}
          </div>
        ) : null}

        <Link
          href="/reviews#moments"
          className="group mt-10 inline-flex items-center gap-2 text-lg font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm"
        >
          <span className="underline decoration-brand-bright decoration-2 underline-offset-[6px]">Explore All Moments &amp; Leave a Review</span>
          <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

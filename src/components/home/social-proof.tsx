import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/home/count-up";
import { ReviewsMarquee } from "@/components/home/reviews-marquee";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { BUSINESS_INFO } from "@/config/business";
import type { Moment, Review } from "@/lib/types";

export function SocialProof({ reviews, moments }: { reviews: Review[]; moments: Moment[] }) {
  const { stats } = BUSINESS_INFO;
  const strip = moments.slice(0, 4);
  const figures = [
    { value: stats.recommendationRate, label: "recommend us" },
    { value: stats.reviewCount, label: "reviews on Facebook" },
    { value: stats.followers, label: "Facebook community" },
    { value: "24/7", label: "always open" },
  ];

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer love"
          align="center"
          className="mx-auto"
          title={
            <>
              Trusted by families who <Accent>care</Accent> about clean
            </>
          }
        />

        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-y-8 md:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label} className="text-center">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <CountUp
                  value={f.value}
                  className="font-display text-5xl font-semibold tracking-tight text-brand-strong sm:text-6xl"
                />
                <p className="mt-2 text-sm font-medium text-slate-600">{f.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-16">
        <ReviewsMarquee reviews={reviews} />
      </div>

      <div className="container-x">
        {strip.length > 0 ? (
          <div data-testid="moments-strip" className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-8 text-center">
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

import Image from "next/image";
import { BUSINESS_INFO } from "@/config/business";
import { MEDIA } from "@/config/media";
import { HealthSection } from "@/components/about/health-section";
import { MetricsBar, type MetricItem } from "@/components/about/metrics-bar";
import { StandardsSection } from "@/components/about/standards-section";
import { TaglineHighlight } from "@/components/about/tagline-highlight";
import { Accent } from "@/components/shared/accent";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata = { title: "About Us" };

const METRICS: readonly MetricItem[] = [
  { value: BUSINESS_INFO.stats.recommendationRate, label: "Recommendation Rate" },
  { value: BUSINESS_INFO.stats.reviewCount, label: "Verified Reviews" },
  { value: BUSINESS_INFO.stats.followers, label: "Facebook Community" },
  { value: "24/7", label: "Always Open" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Fabric Doctor" subtitle="Fabric Pro Sofa Cleaning Service" />

      <section className="bg-white py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Story"
            title={
              <>
                Clean fabrics, <Accent>healthier</Accent> homes
              </>
            }
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-surface ring-1 ring-slate-200/70">
              <Image
                src={MEDIA.about.src}
                alt={MEDIA.about.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>{BUSINESS_INFO.description}</p>
              <p>
                From the first fabric inspection to the final moisture extraction, every step is planned around two
                things: protecting the fabric and protecting the people who live with it. That means fabric-safe
                solutions, specialised extraction equipment and a finish that is fresh and dry.
              </p>
              <p>
                We clean sofas, mattresses, chairs and carpets at your doorstep, and we&apos;re always open, 24/7 — so a
                deep clean fits around your day, not the other way round.
              </p>

              <figure className="mt-8 rounded-3xl bg-surface p-6 ring-1 ring-slate-200/70 sm:p-8">
                <figcaption className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Our promise
                </figcaption>
                <blockquote className="mt-3">
                  <TaglineHighlight />
                </blockquote>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <HealthSection />
      <MetricsBar items={METRICS} />
      <StandardsSection />
    </>
  );
}

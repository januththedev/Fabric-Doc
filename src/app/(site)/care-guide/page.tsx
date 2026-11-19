import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { CtaBanner } from "@/components/shared/cta-banner";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { CARE_LABEL_CODES, ROUTINE_CARE, STAIN_FIRST_AID, STAIN_GUIDE } from "@/config/content";
import { MEDIA } from "@/config/media";

export const metadata: Metadata = {
  title: "Stain & Care Guide",
  description:
    "Simple, safe first aid for spills on sofas, mattresses, chairs and carpets — plus how to read fabric care labels and keep upholstery fresh between deep cleans.",
};

export default function CareGuidePage() {
  return (
    <>
      <PageHero
        title={
          <>
            Stain &amp; <Accent tone="dark">Care</Accent> Guide
          </>
        }
        subtitle="What to do in the first few minutes after a spill, how to read the label under your cushions, and the small habits that keep fabric fresh."
      />

      {/* ---------- First aid ---------- */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Stain first aid"
            title={
              <>
                Six rules for <Accent>any</Accent> spill
              </>
            }
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STAIN_FIRST_AID.map((tip, i) => (
              <li
                key={tip.title}
                className="rounded-3xl bg-surface p-7 ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="font-display text-4xl font-semibold text-brand-strong">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{tip.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{tip.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Care labels ---------- */}
      <section className="bg-ink py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Read the label"
              title={
                <>
                  The code under your <Accent tone="dark">cushions</Accent>
                </>
              }
              description="Most upholstery carries a cleaning code on a tag under the seat cushions or beneath the frame. Check it before any liquid touches the fabric."
            />
            <div className="group relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={MEDIA.gallery.fabricTexture.src}
                alt={MEDIA.gallery.fabricTexture.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {CARE_LABEL_CODES.map((c) => (
              <div key={c.code} className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10">
                <dt className="font-display text-5xl font-semibold text-brand-bright">{c.code}</dt>
                <dd className="mt-3 leading-relaxed text-slate-300">{c.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Stain by stain ---------- */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Stain by stain"
            title={
              <>
                Common spills, <Accent>calmly</Accent> handled
              </>
            }
            description="Quick holding steps until a deep clean. When in doubt, blot and message us a photo."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STAIN_GUIDE.map((s) => (
              <article key={s.stain} className="flex flex-col rounded-3xl bg-white p-7 shadow-soft ring-1 ring-slate-200/70">
                <h3 className="font-display text-2xl font-semibold text-ink">{s.stain}</h3>
                <p className="mt-5 flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-strong" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Do: </span>
                    {s.doThis}
                  </span>
                </p>
                <p className="mt-4 flex items-start gap-3 text-slate-600">
                  <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Avoid: </span>
                    {s.avoid}
                  </span>
                </p>
              </article>
            ))}
          </div>
          <p className="mt-10 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            General guidance only. Fabrics react differently — always test on a hidden spot first, and stop if colour starts to move.
          </p>
        </div>
      </section>

      {/* ---------- Routine care ---------- */}
      <section className="bg-white py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Everyday care"
              title={
                <>
                  Small habits, <Accent>fresher</Accent> fabric
                </>
              }
            />
            <div className="group relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={MEDIA.gallery.cushions.src}
                alt={MEDIA.gallery.cushions.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {ROUTINE_CARE.map((r) => (
              <li key={r.title} className="border-t-2 border-brand pt-5">
                <h3 className="font-display text-xl font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

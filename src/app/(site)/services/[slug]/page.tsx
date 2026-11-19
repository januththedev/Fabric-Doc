import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ScanSearch, ShieldCheck, Wind } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Accent } from "@/components/shared/accent";
import { CtaBanner } from "@/components/shared/cta-banner";
import { FaqSection } from "@/components/shared/faq-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { PROCESS_STEPS } from "@/config/business";
import { FALLBACK_SERVICE_DETAIL, FAQS, SERVICE_DETAILS } from "@/config/content";
import { MEDIA } from "@/config/media";
import { buildServiceMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { getServices } from "@/server/queries";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function findService(slug: string) {
  const services = await getServices();
  return { service: services.find((s) => s.slug === slug) ?? null, services };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await findService((await params).slug);
  if (!service) return { title: "Service not found" };
  return { title: service.title, description: service.shortDesc };
}

const STEP_ICONS = [ScanSearch, ShieldCheck, Wind];

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const { service, services } = await findService(slug);
  if (!service) notFound();

  const detail = SERVICE_DETAILS[service.slug] ?? FALLBACK_SERVICE_DETAIL;
  const included = service.highlights.length > 0 ? [...new Set([...detail.included, ...service.highlights])] : detail.included;
  const heroImage = service.imageSrc ?? MEDIA.gallery[detail.gallery[0]].src;
  const gallery = detail.gallery.map((key) => MEDIA.gallery[key]);
  const others = services.filter((s) => s.id !== service.id);
  const bookUrl = buildWhatsAppUrl(buildServiceMessage(service.title));

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-night pb-20 pt-32 sm:pt-40">
        <div className="absolute inset-0 -z-20 animate-settle">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/85 to-night/40" />
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="animate-rise text-sm text-slate-300">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href="/#services" className="hover:text-white">
              Services
            </Link>
          </nav>
          <h1
            className="animate-rise mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
            style={{ animationDelay: "0.08s" }}
          >
            {service.title}
          </h1>
          <p className="animate-rise mt-5 max-w-2xl text-lg leading-relaxed text-slate-300" style={{ animationDelay: "0.16s" }}>
            {service.shortDesc}
          </p>
          <div className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.24s" }}>
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-7 font-semibold text-white shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
            >
              <WhatsAppIcon className="size-5" />
              Book {service.title}
            </a>
            <a
              href="#included"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-white/10 active:translate-y-0 active:scale-[0.98]"
            >
              What&apos;s included
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Intro + included ---------- */}
      <section id="included" className="scroll-mt-24 bg-white py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The service"
              title={
                <>
                  What a <Accent>proper</Accent> clean looks like
                </>
              }
            />
            <p className="mt-6 text-lg leading-relaxed text-slate-600">{detail.intro}</p>
            {detail.goodFor.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-strong">Good for</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {detail.goodFor.map((g) => (
                    <li key={g} className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900">
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl bg-surface p-8 ring-1 ring-slate-200/70 sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-ink">What&apos;s included</h2>
            <ul className="mt-6 space-y-4">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-strong" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
              Pricing depends on the size, fabric and condition. Send a photo on WhatsApp for a clear quote before we start.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section className="bg-surface pb-20 md:pb-28">
        <div className="container-x grid gap-4 pt-20 md:h-[34rem] md:grid-cols-3 md:grid-rows-2 md:pt-28 md:[&>*]:aspect-auto">
          {gallery.map((img, i) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden rounded-3xl bg-slate-200 aspect-[4/3] ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="bg-ink py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            eyebrow="How it's done"
            title={
              <>
                Three steps, <Accent tone="dark">every</Accent> time
              </>
            }
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <li
                  key={step.number}
                  className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07]"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-bright/15 text-brand-bright">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-brand-bright">Step {step.number}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-300">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <FaqSection faqs={FAQS.slice(0, 5)} eyebrow="Before you book" />

      {/* ---------- Other services ---------- */}
      {others.length > 0 ? (
        <section className="bg-white py-20 md:py-28">
          <div className="container-x">
            <SectionHeading eyebrow="More services" title="We also clean" />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/services/${o.slug}`}
                    className="group flex h-full items-center justify-between gap-4 rounded-2xl bg-surface p-6 ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:ring-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                  >
                    <span className="font-display text-lg font-semibold text-ink">{o.title}</span>
                    <ArrowRight
                      className="size-5 shrink-0 text-brand-strong transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBanner />
    </>
  );
}

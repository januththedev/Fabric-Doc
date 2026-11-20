import Image from "next/image";
import { Phone, Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { BUSINESS_INFO } from "@/config/business";
import { MEDIA } from "@/config/media";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const LINES = ["Deep cleaning for", "sofas, mattresses,", "chairs & carpets."];

/** The rotating stamp's text runs round a circle (SVG textPath); the stamp turns slowly. */
function OpenStamp() {
  return (
    <div className="fd-stamp grid size-32 place-items-center rounded-full bg-sun text-night shadow-[0_18px_40px_-12px_rgb(255_122_47/0.55)] sm:size-36">
      <svg viewBox="0 0 120 120" className="fd-stamp-ring absolute size-full" aria-hidden="true">
        <defs>
          <path id="fd-stamp-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-night text-[10.5px] font-bold uppercase tracking-[0.2em]">
          <textPath href="#fd-stamp-path">Always open · Book any time ·</textPath>
        </text>
      </svg>
      <span className="font-display text-3xl font-extrabold leading-none">24/7</span>
    </div>
  );
}

export function Hero() {
  const { stats } = BUSINESS_INFO;
  const photo = MEDIA.gallery.sofaVacuum;

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-surface pt-28 sm:pt-32 lg:pt-32">
      <div className="container-x grid items-center gap-12 pb-16 lg:grid-cols-[1.45fr_1fr] lg:gap-12 lg:pb-24">
        <div>
          <h1 className="font-display text-[clamp(2.3rem,4.7vw,4.5rem)] font-extrabold leading-[0.95] text-ink">
            {LINES.map((line, i) => (
              <span key={line} className="fd-line block overflow-hidden pb-[0.06em]">
                <span className="fd-line-in block" style={{ animationDelay: `${0.08 + i * 0.09}s` }}>
                  {i === 0 ? line : <span className={i === 2 ? "text-brand-strong" : undefined}>{line}</span>}
                </span>
                {i < LINES.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <p className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl" style={{ animationDelay: "0.35s" }}>
            Stains, dust mites, allergens and odours lifted out of the fabric — at your doorstep, any time of day.
          </p>

          <div className="animate-rise mt-9 flex flex-col gap-4 sm:flex-row sm:items-center" style={{ animationDelay: "0.45s" }}>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-brand-strong px-8 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgb(15_118_110/0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
            >
              <WhatsAppIcon className="size-5 transition-transform duration-300 group-hover:-rotate-12" />
              Book on WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-6 text-base font-bold text-ink ring-2 ring-ink/10 transition duration-300 hover:ring-ink/30 focus-visible:outline-none focus-visible:ring-brand-bright"
            >
              <Phone className="size-4 text-brand-strong" aria-hidden="true" />
              {BUSINESS_INFO.phoneDisplay}
            </a>
          </div>

          <p className="animate-rise mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-700" style={{ animationDelay: "0.55s" }}>
            <span className="inline-flex gap-0.5 text-sun" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </span>
            <span>{stats.recommendationRate} recommend us</span>
            <span className="text-slate-300" aria-hidden="true">/</span>
            <span>{stats.reviewCount} reviews on Facebook</span>
          </p>
        </div>

        {/* The work itself, with the mascot standing in front of it. */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="fd-hero-photo relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-slate-200 sm:aspect-square lg:aspect-[5/6]">
            <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <Image
            src="/brand/mascot.png"
            alt=""
            width={560}
            height={502}
            priority
            className="fd-hero-mascot absolute bottom-0 -left-4 h-32 w-auto drop-shadow-[0_16px_24px_rgb(11_17_32/0.35)] sm:-left-10 sm:h-44 lg:-left-16 lg:h-52"
          />
          <div className="absolute -top-6 right-4 sm:-right-4">
            <OpenStamp />
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Service } from "@/lib/types";

const linkClass =
  "relative inline-block py-1 text-slate-300 transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-brand-bright after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm";

export function Footer({ services }: { services: readonly Pick<Service, "title">[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative isolate overflow-hidden bg-ink text-slate-300">
      {/* soft brand glow so the footer reads as part of the page, not a separate slab */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(48rem_22rem_at_15%_0%,rgb(20_184_166/0.14),transparent_70%),radial-gradient(40rem_20rem_at_100%_100%,rgb(15_118_110/0.16),transparent_70%)]"
      />
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:py-20">
        <div>
          <Link
            href="/"
            aria-label={`${BUSINESS_INFO.brandName} — home`}
            className="inline-block rounded-xl transition-transform duration-300 hover:-rotate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
          >
            <Image
              src="/brand/logo-full.png"
              alt={BUSINESS_INFO.brandName}
              width={380}
              height={486}
              className="h-36 w-auto drop-shadow-[0_14px_30px_rgb(20_184_166/0.25)]"
            />
          </Link>
          <p className="mt-5 max-w-xs font-display text-lg italic leading-snug text-white">
            {BUSINESS_INFO.tagline}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-sm text-slate-200 ring-1 ring-white/10">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            Always Open (24/7)
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Quick links</h2>
          <ul className="mt-4 space-y-1.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Services</h2>
          <ul className="mt-4 space-y-1.5">
            {services.map((s) => (
              <li key={s.title}>
                <Link href="/#services" className={linkClass}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Get in touch</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className={`${linkClass} inline-flex items-center gap-2.5`}>
                <Phone className="size-4 text-brand-bright" aria-hidden="true" />
                {BUSINESS_INFO.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} inline-flex items-center gap-2.5`}
              >
                <WhatsAppIcon className="size-4 text-brand-bright" />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fabric Doctor on Facebook"
                className={`${linkClass} inline-flex items-center gap-2.5`}
              >
                <FacebookIcon className="size-4 text-brand-bright" />
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BUSINESS_INFO.brandName} — {BUSINESS_INFO.legalSubtitle}
          </p>
          <a
            href="#main"
            className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-slate-300 ring-1 ring-white/10 transition hover:-translate-y-px hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright sm:self-auto"
          >
            <ArrowUp className="size-3.5" aria-hidden="true" />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

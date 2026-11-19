import Link from "next/link";
import { Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Logo } from "@/components/layout/logo";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Service } from "@/lib/types";

const linkClass =
  "relative inline-block py-1 text-slate-300 transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-brand-bright after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm";

export function Footer({ services }: { services: readonly Pick<Service, "title">[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
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
        <p className="container-x py-6 text-sm text-slate-400">
          © {year} {BUSINESS_INFO.brandName} — {BUSINESS_INFO.legalSubtitle}
        </p>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { FooterClock } from "@/components/layout/footer-clock";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Service } from "@/lib/types";

/** A directory link: slides right and grows an arrow on hover. */
function DirLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className =
    "group/link inline-flex items-center gap-1.5 py-1 text-[1.05rem] text-slate-300 transition-[color,transform] duration-300 hover:translate-x-1 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm";
  const arrow = (
    <ArrowUpRight
      className="size-4 -translate-x-1 opacity-0 transition duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100"
      aria-hidden="true"
    />
  );
  return external ? (
    <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className}>
      {children}
      {arrow}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
      {arrow}
    </Link>
  );
}

function ColumnLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-white" data-index={index}>
      {children}
    </h2>
  );
}

/**
 * The page's closing section: a big call to action, the directory, and the name set across the
 * full width, its letters rising into place as the footer scrolls in (CSS scroll timeline; static elsewhere).
 */
export function Footer({ services }: { services: readonly Pick<Service, "title">[] }) {
  const year = new Date().getFullYear();
  const letters = [...BUSINESS_INFO.brandName];

  return (
    <footer className="fd-footer relative isolate overflow-hidden bg-[#070b14] text-slate-300">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_0%,rgb(20_184_166/0.16),transparent_65%),radial-gradient(50rem_26rem_at_0%_70%,rgb(15_118_110/0.14),transparent_70%)]"
      />

      {/* Row 1: the close */}
      <div className="container-x pt-24 sm:pt-32">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
          <p className="font-display text-[clamp(2.75rem,7.4vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
            Fresh fabrics,
            <br />
            <span className="text-brand-bright">healthier home.</span>
          </p>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-orb group relative grid size-40 shrink-0 place-items-center rounded-full bg-sun text-night transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:size-44"
            >
              <span className="flex flex-col items-center gap-1.5 text-center text-sm font-semibold leading-tight">
                <WhatsAppIcon className="size-7 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                Message us
                <br />
                on WhatsApp
              </span>
            </a>
            <a
              href={`tel:${BUSINESS_INFO.phoneRaw}`}
              className="group inline-flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-md sm:text-4xl"
            >
              <Phone className="size-6 text-brand-bright" aria-hidden="true" />
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                {BUSINESS_INFO.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Row 2: the directory */}
      <div className="container-x mt-20 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:mt-28 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <p className="font-display text-xl leading-snug text-white">{BUSINESS_INFO.tagline}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-sm text-slate-200 ring-1 ring-white/10">
            Always Open (24/7)
          </p>
        </div>

        <nav aria-label="Footer">
          <ColumnLabel index="01">Pages</ColumnLabel>
          <ul className="mt-4 space-y-0.5">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <DirLink href={l.href}>{l.label}</DirLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnLabel index="02">Services</ColumnLabel>
          <ul className="mt-4 space-y-0.5">
            {services.map((s) => (
              <li key={s.title}>
                <DirLink href="/#services">{s.title}</DirLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnLabel index="03">Get in touch</ColumnLabel>
          <ul className="mt-4 space-y-0.5">
            <li>
              <DirLink href={`tel:${BUSINESS_INFO.phoneRaw}`} external>
                {BUSINESS_INFO.phoneDisplay}
              </DirLink>
            </li>
            <li>
              <DirLink href={buildWhatsAppUrl()} external>
                <WhatsAppIcon className="size-4 text-brand-bright" />
                WhatsApp
              </DirLink>
            </li>
            <li>
              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fabric Doctor on Facebook"
                className="group/link inline-flex items-center gap-1.5 py-1 text-[1.05rem] text-slate-300 transition-[color,transform] duration-300 hover:translate-x-1 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm"
              >
                <FacebookIcon className="size-4 text-brand-bright" />
                Facebook
                <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Row 3: the name, set across the full width */}
      <div className="fd-word-wrap relative mt-10 pt-[13vw] sm:mt-12" aria-hidden="true">
        <Image
          src="/brand/mascot.png"
          alt=""
          width={272}
          height={240}
          className="fd-word-mascot absolute right-[6vw] bottom-[34%] z-0 h-[12vw] min-h-12 w-auto [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
        />
        <p className="fd-word">
          {letters.map((ch, i) => (
            <span key={i} className="fd-word-letter" style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
      </div>

      {/* Row 4: the legal line */}
      <div className="relative border-t border-white/10 bg-[#070b14]">
        <div className="container-x flex flex-col gap-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BUSINESS_INFO.brandName} — {BUSINESS_INFO.legalSubtitle}
          </p>
          <div className="flex items-center gap-5">
            <FooterClock />
            <a
              href="#main"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-slate-300 ring-1 ring-white/15 transition hover:-translate-y-px hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
            >
              <ArrowUp className="size-3.5" aria-hidden="true" />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

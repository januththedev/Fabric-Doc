import type { ReactNode } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { VacuumArt } from "@/components/shared/vacuum-art";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const QUICK_LINKS = [
  { href: "/#services", label: "Our services" },
  { href: "/reviews", label: "Reviews & Moments" },
  { href: "/care-guide", label: "Stain & Care Guide" },
  { href: "/contact", label: "Contact us" },
];

/** Shared layout for the 404 and error pages. */
export function ErrorScreen({
  code,
  title,
  message,
  actions,
  fullScreen = false,
}: {
  fullScreen?: boolean;
  code: string;
  title: string;
  message: string;
  actions: ReactNode;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-night px-4 pb-24 pt-32 sm:pt-40 ${fullScreen ? "flex min-h-screen items-center" : ""}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_80%_10%,rgb(20_184_166/0.18),transparent),radial-gradient(40rem_24rem_at_10%_90%,rgb(15_118_110/0.25),transparent)]"
      />
      <div className="container-x grid w-full items-center gap-12 lg:grid-cols-2">
        <div className="animate-rise">
          <p className="font-display text-7xl font-extrabold leading-none text-brand-bright sm:text-8xl">{code}</p>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-300">{message}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">{actions}</div>
          <nav aria-label="Helpful links" className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Or try one of these</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-4 text-sm font-medium text-slate-200 ring-1 ring-white/10 transition hover:-translate-y-px hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="animate-rise text-white" style={{ animationDelay: "0.15s" }}>
          <VacuumArt className="mx-auto w-full max-w-md" />
        </div>
      </div>
    </section>
  );
}

export const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-7 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night";
export const ghostButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-white/10 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright";

export function WhatsAppButton() {
  return (
    <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className={ghostButton}>
      <WhatsAppIcon className="size-5" />
      Message us
    </a>
  );
}

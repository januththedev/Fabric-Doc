import { ArrowUpRight } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const rowClass =
  "group flex items-center justify-between gap-4 border-t border-ink/10 py-6 transition-colors duration-300 hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm";
const labelClass = "block text-sm font-semibold text-slate-500";
const valueClass = "mt-1 block font-display text-2xl font-extrabold text-ink transition-colors duration-300 group-hover:text-brand-strong sm:text-3xl";
const arrow = (
  <ArrowUpRight
    className="size-7 shrink-0 text-ink/30 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-strong"
    aria-hidden="true"
  />
);

/** The direct ways to reach us, set large: call, WhatsApp, Facebook, then the hours. */
export function ContactCards() {
  return (
    <div className="border-b border-ink/10">
      <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className={rowClass}>
        <span>
          <span className={labelClass}>Call us</span>
          <span className={valueClass}>{BUSINESS_INFO.phoneDisplay}</span>
        </span>
        {arrow}
      </a>

      <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className={rowClass}>
        <span>
          <span className={labelClass}>WhatsApp</span>
          <span className={`${valueClass} inline-flex items-center gap-2.5`}>
            <WhatsAppIcon className="size-6 text-brand-strong" />
            Chat on WhatsApp
          </span>
        </span>
        {arrow}
      </a>

      <a href={BUSINESS_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
        <span>
          <span className={labelClass}>Facebook</span>
          <span className={`${valueClass} inline-flex items-center gap-2.5`}>
            <FacebookIcon className="size-6 text-brand-strong" />
            {BUSINESS_INFO.facebookHandle}
          </span>
        </span>
        {arrow}
      </a>

      <div className="flex items-center justify-between gap-4 border-t border-ink/10 py-6">
        <span>
          <span className={labelClass}>Hours</span>
          <span className={`${valueClass} flex items-center gap-3`}>
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
            </span>
            Always Open (24/7)
          </span>
        </span>
      </div>
    </div>
  );
}

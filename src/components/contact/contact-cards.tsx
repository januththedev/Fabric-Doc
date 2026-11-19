import { Clock, Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const cardClass =
  "group flex h-full items-start gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgb(15_23_42/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2";
const iconTileClass =
  "grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-brand-strong transition-colors duration-300 group-hover:bg-brand-strong group-hover:text-white";
const labelClass = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
const valueClass = "mt-1 text-base font-semibold text-ink";

export function ContactCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className={cardClass}>
        <span className={iconTileClass}>
          <Phone className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className={labelClass}>Call us</span>
          <span className={`${valueClass} block`}>{BUSINESS_INFO.phoneDisplay}</span>
        </span>
      </a>

      <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <span className={iconTileClass}>
          <WhatsAppIcon className="size-5" />
        </span>
        <span>
          <span className={labelClass}>WhatsApp</span>
          <span className={`${valueClass} block`}>Chat on WhatsApp</span>
        </span>
      </a>

      <a href={BUSINESS_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <span className={iconTileClass}>
          <FacebookIcon className="size-5" />
        </span>
        <span>
          <span className={labelClass}>Facebook</span>
          <span className={`${valueClass} block`}>{BUSINESS_INFO.facebookHandle}</span>
        </span>
      </a>

      <div className={cardClass}>
        <span className={iconTileClass}>
          <Clock className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className={labelClass}>Hours</span>
          <span className={`${valueClass} flex items-center gap-2`}>
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            Always Open (24/7)
          </span>
        </span>
      </div>
    </div>
  );
}

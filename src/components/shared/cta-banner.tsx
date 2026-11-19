import { Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const buttonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-300 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-strong";

/**
 * Closing call to action, always the last section before the footer.
 * The section background turns footer-dark halfway down, so the card straddles the seam and joins the two.
 */
export function CtaBanner() {
  return (
    <section className="bg-[linear-gradient(to_bottom,#fff_0,#fff_50%,var(--color-ink)_50%)] pt-6 md:pt-10">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-strong via-teal-800 to-[#0b3f3c] p-8 shadow-[0_30px_80px_-30px_rgb(15_118_110/0.55)] ring-1 ring-white/10 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:p-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Fresh, healthy fabrics are one message away.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
              Call {BUSINESS_INFO.phoneDisplay} or message us on WhatsApp — we&apos;re Always Open, 24/7.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className={`${buttonClass} bg-white text-brand-strong hover:bg-mint`}>
              <Phone className="size-4" aria-hidden="true" />
              Call {BUSINESS_INFO.phoneDisplay}
            </a>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonClass} bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20`}
            >
              <WhatsAppIcon className="size-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

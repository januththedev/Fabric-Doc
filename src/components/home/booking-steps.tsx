import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { BOOKING_STEPS } from "@/config/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function BookingSteps() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            tone="dark"
            eyebrow="How booking works"
            title={
              <>
                From one message to <Accent tone="dark">fresh</Accent> fabric
              </>
            }
          />
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-brand-bright px-7 font-semibold text-night transition duration-200 hover:-translate-y-px hover:bg-teal-300 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <WhatsAppIcon className="size-5" />
            Start on WhatsApp
          </a>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKING_STEPS.map((s, i) => (
            <li
              key={s.title}
              className="group relative rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07]"
            >
              <span className="font-display text-6xl font-semibold leading-none text-brand-bright">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

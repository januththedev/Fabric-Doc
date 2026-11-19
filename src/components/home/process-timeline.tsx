import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { PROCESS_STEPS } from "@/config/business";
import { BOOKING_STEPS } from "@/config/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const GROUPS = [
  {
    label: "Booking",
    steps: BOOKING_STEPS.slice(0, 3).map((s) => ({ title: s.title, text: s.text })),
  },
  {
    label: "On the day, at your door",
    steps: PROCESS_STEPS.map((s) => ({ title: s.title, text: s.description })),
  },
];

/**
 * How it works, start to finish: the three booking steps and the three cleaning steps as one numbered run.
 * The numbers carry the order, so they stay.
 */
export function ProcessTimeline() {
  let n = 0;
  return (
    <section className="relative isolate overflow-hidden bg-brand-strong py-24 text-white md:py-32">
      <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-brand-bright/25 blur-3xl" />
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-3xl font-display text-4xl font-extrabold leading-[0.98] sm:text-5xl lg:text-6xl">
            One message. Six steps. Fresh fabric.
          </h2>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 w-fit items-center gap-2.5 rounded-full bg-white px-7 text-base font-bold text-brand-strong transition duration-300 hover:-translate-y-0.5 hover:bg-sun hover:text-night active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-strong"
          >
            <WhatsAppIcon className="size-5" />
            Start on WhatsApp
          </a>
        </div>

        <div className="mt-16 space-y-14">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <h3 className="flex items-center gap-4 text-sm font-bold uppercase tracking-[0.14em] text-teal-100">
                {g.label}
                <span aria-hidden="true" className="h-px flex-1 bg-white/20" />
              </h3>
              <ol className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
                {g.steps.map((s) => {
                  n += 1;
                  return (
                    <li key={s.title} className="group">
                      <span className="font-display text-7xl font-extrabold leading-none text-sun transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 inline-block">
                        {n}
                      </span>
                      <p className="mt-5 font-display text-2xl font-extrabold leading-tight">{s.title}</p>
                      <p className="mt-3 max-w-sm leading-relaxed text-teal-50/85">{s.text}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

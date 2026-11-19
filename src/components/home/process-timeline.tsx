import { ScanSearch, ShieldCheck, Wind, type LucideIcon } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { PROCESS_STEPS } from "@/config/business";

const ICONS: LucideIcon[] = [ScanSearch, ShieldCheck, Wind];

/**
 * This page's scroll moment: the line draws through the three steps and each step lights up as it is reached.
 * Driven by CSS scroll timelines (see .fd-steps in globals.css), so it costs no JavaScript.
 * Browsers without scroll timelines, and reduced-motion visitors, see the finished state.
 */
export function ProcessTimeline() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="How We Work"
          title={
            <>
              Our <Accent>health-first</Accent> 3-step deep clean
            </>
          }
          align="center"
        />

        <div className="fd-steps relative mx-auto mt-14 max-w-5xl">
          {/* Desktop line (horizontal) */}
          <div aria-hidden="true" className="absolute left-[16.7%] right-[16.7%] top-7 hidden h-0.5 bg-slate-200 md:block">
            <span className="fd-draw-x absolute inset-0 origin-left bg-brand-strong" />
          </div>
          {/* Mobile line (vertical) */}
          <div aria-hidden="true" className="absolute bottom-7 left-7 top-7 w-0.5 -translate-x-1/2 bg-slate-200 md:hidden">
            <span className="fd-draw-y absolute inset-0 origin-top bg-brand-strong" />
          </div>

          <ol className="relative grid gap-0 md:grid-cols-3 md:gap-8">
            {PROCESS_STEPS.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <li key={step.number} className="relative flex gap-5 pb-12 last:pb-0 md:block md:pb-0 md:text-center">
                  <span
                    data-step={i + 1}
                    className="fd-step-icon relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-brand-strong text-white ring-8 ring-white md:mx-auto"
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="md:mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">Step {step.number}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink">{step.title}</h3>
                    <p className="mt-3 max-w-xs leading-relaxed text-slate-600 md:mx-auto">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

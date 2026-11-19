"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ScanSearch, ShieldCheck, Wind, type LucideIcon } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { PROCESS_STEPS } from "@/config/business";

const ICONS: LucideIcon[] = [ScanSearch, ShieldCheck, Wind];

function Step({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const Icon = ICONS[index];
  const step = PROCESS_STEPS[index];
  // Each step lights up once the drawn line reaches it.
  const start = index * 0.3;
  const lit = useTransform(progress, [start, start + 0.2], [0, 1]);
  const background = useTransform(lit, [0, 1], ["#e2e8f0", "#0f766e"]);
  const color = useTransform(lit, [0, 1], ["#64748b", "#ffffff"]);

  return (
    <li className="relative flex gap-5 pb-12 last:pb-0 md:block md:pb-0 md:text-center">
      <motion.span
        style={{ background, color }}
        className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full ring-8 ring-white md:mx-auto"
      >
        <Icon className="size-6" aria-hidden="true" />
      </motion.span>
      <div className="md:mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">Step {step.number}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink">{step.title}</h3>
        <p className="mt-3 max-w-xs leading-relaxed text-slate-600 md:mx-auto">{step.description}</p>
      </div>
    </li>
  );
}

/** This page's dealt scroll moment: the line draws through the three steps as the section scrolls past. */
export function ProcessTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const complete = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = reduce ? complete : scrollYProgress;

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

        <div ref={ref} className="relative mx-auto mt-14 max-w-5xl">
          {/* Desktop line (horizontal) */}
          <div aria-hidden="true" className="absolute left-[16.7%] right-[16.7%] top-7 hidden h-0.5 bg-slate-200 md:block">
            <motion.span style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-brand-strong" />
          </div>
          {/* Mobile line (vertical) */}
          <div aria-hidden="true" className="absolute bottom-7 left-7 top-7 w-0.5 -translate-x-1/2 bg-slate-200 md:hidden">
            <motion.span style={{ scaleY: progress }} className="absolute inset-0 origin-top bg-brand-strong" />
          </div>

          <ol className="relative grid gap-0 md:grid-cols-3 md:gap-8">
            {PROCESS_STEPS.map((_, i) => (
              <Step key={i} index={i} progress={progress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

/** Compact dark header for About and Contact. Its h1 is the page's only h1. */
export function PageHero({ title, subtitle }: { title: ReactNode; subtitle?: string }) {
  return (
    <section className="bg-night pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="container-x">
        <Reveal>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{subtitle}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}

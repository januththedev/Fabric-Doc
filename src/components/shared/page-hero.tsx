import Image from "next/image";
import type { ReactNode } from "react";

/** Inner-page header: the title set large on the paper ground, the mascot keeping an eye on it. Its h1 is the page's only h1. */
export function PageHero({ title, subtitle }: { title: ReactNode; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10 bg-surface pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="container-x flex items-end justify-between gap-10">
        <div>
          <h1 className="max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-extrabold leading-[0.95] text-ink">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="fd-line-in block">{title}</span>
            </span>
          </h1>
          {subtitle ? (
            <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl" style={{ animationDelay: "0.2s" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <Image
          src="/brand/mascot.png"
          alt=""
          width={560}
          height={502}
          priority
          className="fd-hero-mascot hidden h-40 w-auto shrink-0 lg:block"
        />
      </div>
    </section>
  );
}

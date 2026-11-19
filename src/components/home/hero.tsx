"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Reveal } from "@/components/motion/reveal";
import { Accent } from "@/components/shared/accent";
import { BUSINESS_INFO } from "@/config/business";
import { MEDIA } from "@/config/media";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-night";

export function Hero() {
  const reduce = useReducedMotion();
  const { stats } = BUSINESS_INFO;

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-night">
      {/* Photo settles once on load. No scroll parallax. */}
      <motion.div
        className="absolute inset-0 -z-20"
        initial={reduce ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <Image src={MEDIA.hero.src} alt={MEDIA.hero.alt} fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      {/* Scrim: keeps the headline readable over the photo. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-night/90 via-night/65 to-night" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-night/70 via-night/10 to-transparent" />

      <div className="container-x pb-20 pt-32">
        <div className="max-w-3xl">
          <Reveal>
            <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
              ★ {stats.recommendationRate} Recommended ({stats.reviewCount} Reviews) · Always Open 24/7
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              We Don&apos;t Just Clean — We <Accent tone="dark">Care</Accent> For Your Health.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Deep sanitization, stain extraction, and allergen removal for your{" "}
              <strong className="font-semibold text-white">Sofas, Mattresses, Chairs &amp; Carpets</strong>.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn} bg-brand-strong text-white shadow-lg shadow-black/25 hover:bg-teal-800`}
              >
                <WhatsAppIcon className="size-5" />
                Book on WhatsApp
              </a>
              <Link href="/reviews" className={`${btn} border border-white/40 text-white hover:bg-white/10`}>
                See Reviews &amp; Moments
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

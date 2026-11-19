"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Moment } from "@/lib/types";
import { cn } from "@/lib/utils";

// A deterministic mix of ratios gives the grid its masonry rhythm.
const RATIOS = ["aspect-[4/5]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]", "aspect-[5/4]"];

function attribution(m: Moment) {
  return m.sourceType === "review" && m.reviewerName ? `Shared by ${m.reviewerName}` : "Fabric Doctor Transformation";
}

export function MomentsGallery({ moments }: { moments: Moment[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
        {moments.map((m, i) => (
          <motion.li
            key={m.id}
            className="mb-3 break-inside-avoid md:mb-4"
            // This page's dealt moment: the tiles resolve once as the gallery scrolls into view.
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.05 }}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${moments.length}`}
              className="group relative block w-full overflow-hidden rounded-2xl bg-slate-800 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <span className={cn("relative block w-full", RATIOS[i % RATIOS.length])}>
                <Image
                  src={m.imageSrc}
                  alt={m.caption ?? attribution(m)}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-night/60 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur">
                {attribution(m)}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <Lightbox
        open={open !== null}
        index={open ?? 0}
        close={() => setOpen(null)}
        plugins={[Captions]}
        slides={moments.map((m) => ({
          src: m.imageSrc,
          alt: m.caption ?? attribution(m),
          title: attribution(m),
          description: m.caption ?? undefined,
        }))}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}

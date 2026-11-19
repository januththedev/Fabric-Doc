"use client";

import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { BUSINESS_INFO } from "@/config/business";

// Set on the orange promise card: unlit words stay readable (about 5:1), lit ones go full ink.
const UNLIT = "#5c2a0e";
const LIT = "#0b1120";

function Word({
  word,
  progress,
  index,
  total,
}: {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const color = useTransform(progress, [start, end], [UNLIT, LIT]);

  return (
    <motion.span style={{ color }}>
      {word}
    </motion.span>
  );
}

/**
 * The About page's single dealt scroll moment: the tagline's words light up one
 * by one as the card moves through the viewport. With reduced motion every word
 * is shown lit at once.
 */
export function TaglineHighlight() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.55"],
  });

  const words = BUSINESS_INFO.tagline.split(" ");

  if (reduce) {
    return (
      <p className="font-display text-2xl font-extrabold leading-snug text-night sm:text-3xl lg:text-4xl">
        {BUSINESS_INFO.tagline}
      </p>
    );
  }

  return (
    <div ref={ref}>
      <p className="font-display text-2xl font-extrabold leading-snug sm:text-3xl lg:text-4xl">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <Word word={word} progress={scrollYProgress} index={index} total={words.length} />
            {index < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

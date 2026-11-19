"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the entrance starts. */
  delay?: number;
  /**
   * Animate when scrolled into view instead of on mount.
   * Only for a page's single "dealt moment", inside its own section. Everything else enters on load or not at all.
   */
  onView?: boolean;
};

/** Fade-and-rise entrance. Runs once. Renders a plain div when the user prefers reduced motion. */
export function Reveal({ children, className, delay = 0, onView = false }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const transition = { duration: 0.6, ease: EASE, delay };
  const hidden = { opacity: 0, y: 24 };
  const shown = { opacity: 1, y: 0 };

  return onView ? (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div className={className} initial={hidden} animate={shown} transition={transition}>
      {children}
    </motion.div>
  );
}

/** Staggers its direct children by `stagger` seconds, on mount (or in view with `onView`). */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  onView = false,
}: {
  children: ReactNode[] | ReactNode;
  className?: string;
  stagger?: number;
  onView?: boolean;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((child, i) => (
        <Reveal key={i} delay={i * stagger} onView={onView}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

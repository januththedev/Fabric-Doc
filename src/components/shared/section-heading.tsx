import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  /** Heading level: sections use h2 (the page's h1 lives in its hero). */
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.16em]",
          dark ? "text-brand-bright" : "text-brand-strong",
        )}
      >
        {eyebrow}
      </p>
      <Tag
        className={cn(
          "mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {description ? (
        <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-slate-300" : "text-slate-600")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

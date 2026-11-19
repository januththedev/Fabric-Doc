import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** Kept for call sites and as a reading aid in code; not rendered (headings speak for themselves). */
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  /** Heading level: sections use h2 (the page's h1 lives in its hero). */
  as?: "h1" | "h2";
};

export function SectionHeading({
  title,
  description,
  align = "left",
  tone = "light",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Tag
        className={cn(
          "font-display text-4xl font-extrabold leading-[0.98] sm:text-5xl lg:text-6xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {description ? (
        <p
          className={cn(
            "mt-5 max-w-xl text-base leading-relaxed sm:text-lg",
            align === "center" && "mx-auto",
            dark ? "text-slate-300" : "text-slate-600",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

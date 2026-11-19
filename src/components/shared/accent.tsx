import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * The brand's signature: ONE key word per headline set in teal italic serif.
 * Use it in h1/h2 only, never in body text, and never twice in one heading.
 */
export function Accent({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <em className={cn("font-display italic", tone === "dark" ? "text-brand-bright" : "text-brand-strong")}>
      {children}
    </em>
  );
}

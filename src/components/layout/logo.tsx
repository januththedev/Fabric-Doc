import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BUSINESS_INFO } from "@/config/business";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${BUSINESS_INFO.brandName} — home`}
      className={cn("group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2", className)}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-strong text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight transition-colors duration-300",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        {BUSINESS_INFO.brandName}
      </span>
    </Link>
  );
}

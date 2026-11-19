import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, size = "md", className }: { value: number; size?: "sm" | "md"; className?: string }) {
  return (
    <span role="img" aria-label={`Rated ${value} out of 5`} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            size === "sm" ? "size-4" : "size-5",
            n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300",
          )}
        />
      ))}
    </span>
  );
}

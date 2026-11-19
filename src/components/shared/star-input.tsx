"use client";

import { useState, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible 1–5 star picker: a radiogroup with arrow-key support and a hover preview. */
export function StarInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, value + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, value - 1);
    else return;
    e.preventDefault();
    onChange(next);
    const radios = e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[next - 1]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(null)}
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={n === 1 ? "1 star" : `${n} stars`}
          tabIndex={value === n ? 0 : -1}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className="grid size-11 place-items-center rounded-full transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright active:scale-95"
        >
          <Star
            aria-hidden="true"
            className={cn("size-7 transition-colors", n <= shown ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300")}
          />
        </button>
      ))}
    </div>
  );
}

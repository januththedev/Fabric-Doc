"use client";

import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="grid min-h-[70vh] place-items-center px-4 pb-20 pt-32">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Something went wrong</h1>
        <p className="mt-4 text-slate-600">We couldn&apos;t load this page. Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand-strong px-7 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

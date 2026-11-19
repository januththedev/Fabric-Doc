"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-soft ring-1 ring-slate-200/70">
      <h1 className="font-display text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        The dashboard couldn&apos;t load. Check the database connection, then try again.
        {error.digest ? <span className="mt-2 block text-xs text-slate-600">Reference: {error.digest}</span> : null}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand-strong px-6 font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import "./globals.css";

// Last-resort screen when even the root layout fails. It replaces <html>, so it stays self-contained.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-night px-4 font-sans text-white antialiased">
        <main className="max-w-md text-center">
          <p className="font-display text-6xl font-extrabold text-brand-bright">Oops</p>
          <h1 className="mt-4 font-display text-3xl font-extrabold">Something went wrong</h1>
          <p className="mt-4 text-slate-300">Please try again in a moment.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-12 items-center rounded-full bg-brand-strong px-7 font-semibold text-white hover:bg-teal-800"
            >
              Try again
            </button>
            {/* A plain link on purpose: the app router may be the thing that failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 font-semibold">
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

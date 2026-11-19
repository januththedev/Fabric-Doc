import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Coming soon", robots: { index: false } };

/** Every page except the landing page is still in progress. */
export default function ComingSoon() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Still working on it</h1>
        <p className="mt-3 text-slate-400">This page is coming soon.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-sm font-medium transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}

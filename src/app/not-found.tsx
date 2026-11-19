import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-16">
      <div className="max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-brand-strong">Error 404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for has moved or does not exist.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand-strong px-7 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

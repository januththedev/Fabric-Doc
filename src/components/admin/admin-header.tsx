import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/server/actions/auth";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="[&>span]:hidden sm:[&>span]:inline" />
          <span className="rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-night">Admin</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm sm:gap-4">
          <span className="hidden text-slate-600 md:inline">{email}</span>
          <Link href="/" target="_blank" className="font-medium text-brand-strong hover:underline">
            View site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full border border-slate-300 px-4 font-semibold text-ink transition hover:border-brand-strong hover:text-brand-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

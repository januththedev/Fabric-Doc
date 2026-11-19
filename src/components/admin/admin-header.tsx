import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { signOut } from "@/server/actions/auth";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">Admin</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-slate-600 sm:inline">{email}</span>
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

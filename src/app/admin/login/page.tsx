import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { isAuthConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-slate-200/70 sm:p-10">
        <Logo />
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">Admin Sign In</h1>
        {isAuthConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET.
          </p>
        )}
      </div>
    </main>
  );
}

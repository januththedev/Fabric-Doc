import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Toaster } from "@/components/ui/sonner";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Defence in depth: middleware already redirects, but never rely on one layer.
  const { email } = await requireAdmin();
  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader email={email} />
      <main className="container-x py-10">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}

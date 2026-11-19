import type { ReactNode } from "react";
import { DemoBanner } from "@/components/layout/demo-banner";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getServices } from "@/server/queries";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const services = await getServices();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
      >
        Skip to content
      </a>
      <DemoBanner />
      <Navbar />
      <main id="main">{children}</main>
      <Footer services={services} />
      <FloatingWhatsApp />
    </>
  );
}

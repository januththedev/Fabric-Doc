import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { BUSINESS_INFO } from "@/config/business";
import { MEDIA } from "@/config/media";
import "./globals.css";

// One variable family for everything: wide and heavy for headlines (font-stretch), regular for text.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_INFO.brandName} | ${BUSINESS_INFO.legalSubtitle}`,
    template: `%s | ${BUSINESS_INFO.brandName}`,
  },
  description: BUSINESS_INFO.description,
  applicationName: BUSINESS_INFO.brandName,
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: BUSINESS_INFO.brandName,
    title: `${BUSINESS_INFO.brandName} | ${BUSINESS_INFO.legalSubtitle}`,
    description: BUSINESS_INFO.description,
    images: [{ url: MEDIA.hero.src, alt: MEDIA.hero.alt }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0F766E", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <body className="bg-surface font-sans text-slate-700 antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS_INFO } from "@/config/business";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_INFO.brandName} | ${BUSINESS_INFO.legalSubtitle}`,
    template: `%s | ${BUSINESS_INFO.brandName}`,
  },
  description: BUSINESS_INFO.description,
  applicationName: BUSINESS_INFO.brandName,
};

export const viewport: Viewport = { themeColor: "#0F766E", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-surface font-sans text-slate-700 antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

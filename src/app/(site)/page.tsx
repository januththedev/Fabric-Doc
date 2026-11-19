import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ProcessTimeline } from "@/components/home/process-timeline";
import { ServicesShowcase } from "@/components/home/services-showcase";
import { SocialProof } from "@/components/home/social-proof";
import { CtaBanner } from "@/components/shared/cta-banner";
import { getMoments, getReviews, getServices } from "@/server/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Fabric Doctor | Sofa, Mattress, Chair & Carpet Deep Cleaning in Sri Lanka" },
  description:
    "Fabric Doctor deep-cleans and sanitizes sofas, mattresses, chairs and carpets in Sri Lanka. Stain and allergen removal, always open 24/7 — book on WhatsApp.",
};

export default async function HomePage() {
  const [reviews, moments, services] = await Promise.all([getReviews(), getMoments(), getServices()]);

  return (
    <>
      <Hero />
      <ServicesShowcase services={services} />
      <ProcessTimeline />
      <SocialProof reviews={reviews} moments={moments} />
      <CtaBanner />
    </>
  );
}

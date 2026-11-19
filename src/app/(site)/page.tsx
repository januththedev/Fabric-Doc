import type { Metadata } from "next";
import { Audiences } from "@/components/home/audiences";
import { CareTeaser } from "@/components/home/care-teaser";
import { Comparison } from "@/components/home/comparison";
import { Hero } from "@/components/home/hero";
import { ProblemsBento } from "@/components/home/problems-bento";
import { ProcessTimeline } from "@/components/home/process-timeline";
import { ServicesShowcase } from "@/components/home/services-showcase";
import { SocialProof } from "@/components/home/social-proof";
import { FaqSection } from "@/components/shared/faq-section";
import { getMoments, getReviews, getServices } from "@/lib/preview-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Fabric Doctor | Sofa, Mattress, Chair & Carpet Deep Cleaning in Sri Lanka" },
  description:
    "Fabric Doctor deep-cleans and sanitizes sofas, mattresses, chairs and carpets in Sri Lanka. Stain and allergen removal at your doorstep, always open 24/7 — book on WhatsApp.",
};

export default async function HomePage() {
  const [reviews, moments, services] = await Promise.all([getReviews(), getMoments(), getServices()]);

  return (
    <>
      <Hero />
      <ProblemsBento />
      <ServicesShowcase services={services} />
      <Audiences />
      <ProcessTimeline />
      <SocialProof reviews={reviews} moments={moments} />
      <Comparison />
      <FaqSection />
      <CareTeaser />
    </>
  );
}

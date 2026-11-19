import { FALLBACK_MOMENTS, FALLBACK_REVIEWS, FALLBACK_SERVICES } from "@/data/fallback";
import type { Moment, Review, Service } from "@/lib/types";

/** Preview build: the site shows bundled sample content. */
export async function getReviews(): Promise<Review[]> {
  return FALLBACK_REVIEWS;
}

export async function getMoments(): Promise<Moment[]> {
  return FALLBACK_MOMENTS;
}

export async function getServices(): Promise<Service[]> {
  return FALLBACK_SERVICES;
}

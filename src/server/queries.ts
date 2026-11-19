import "server-only";
import { FETCH_LIMIT } from "@/config/constants";
import { FALLBACK_MOMENTS, FALLBACK_REVIEWS, FALLBACK_SERVICES } from "@/data/fallback";
import { isDbConfigured, isDemoMode } from "@/lib/env";
import type { Inquiry, Moment, Review, Service } from "@/lib/types";
import { listInquiries, listMoments, listReviews, listServices } from "./repo";

/** Runs a read; a database error is logged and becomes an empty result, so public pages never crash. */
async function safe<T>(label: string, run: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[queries] ${label} failed`, error);
    return empty;
  }
}

export async function getReviews(): Promise<Review[]> {
  if (isDemoMode()) return FALLBACK_REVIEWS;
  if (!isDbConfigured()) return [];
  return safe("getReviews", () => listReviews(FETCH_LIMIT), []);
}

export async function getMoments(): Promise<Moment[]> {
  if (isDemoMode()) return FALLBACK_MOMENTS;
  if (!isDbConfigured()) return [];
  return safe("getMoments", () => listMoments(FETCH_LIMIT), []);
}

/** Active services only (the public site). */
export async function getServices(): Promise<Service[]> {
  if (isDemoMode()) return FALLBACK_SERVICES;
  if (!isDbConfigured()) return [];
  return safe("getServices", () => listServices({ includeInactive: false }), []);
}

/** Admin only: includes hidden services. The caller must run requireAdmin() first. */
export async function getAllServices(): Promise<Service[]> {
  if (!isDbConfigured()) return [];
  return safe("getAllServices", () => listServices({ includeInactive: true }), []);
}

/** Admin only. The caller must run requireAdmin() first. */
export async function getInquiries(): Promise<Inquiry[]> {
  if (!isDbConfigured()) return [];
  return safe("getInquiries", () => listInquiries(FETCH_LIMIT), []);
}

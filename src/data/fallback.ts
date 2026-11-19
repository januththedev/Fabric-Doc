import { DEFAULT_SERVICES } from "@/config/business";
import { MEDIA } from "@/config/media";
import type { Moment, Review, Service } from "@/lib/types";

/**
 * Sample content. Used by demo mode (no database) and by `npm run db:seed`.
 * The reviews and moments are INVENTED sample data for local/staging use. Never seed them in production.
 * The services are the owner's real four services and are safe to seed anywhere.
 */

const [PHOTO_MATTRESS, PHOTO_SOFA, PHOTO_CARPET] = MEDIA.seedReviews;
const [ADMIN_SOFA, ADMIN_ARMCHAIR] = MEDIA.adminSeed;

export const FALLBACK_REVIEWS: Review[] = [
  {
    id: "5a1f0c1e-0001-4000-8000-000000000001",
    reviewerName: "Dilini Perera",
    serviceType: "Mattress Sanitization",
    rating: 5,
    comment:
      "Our mattress looks and smells brand new after the sanitization. My son sleeps so much better now. Very professional team and right on time.",
    imageSrc: PHOTO_MATTRESS.src,
    createdAt: "2026-11-17T09:30:00.000Z",
  },
  {
    id: "5a1f0c1e-0001-4000-8000-000000000002",
    reviewerName: "Kasun Fernando",
    serviceType: "Sofa Deep Cleaning",
    rating: 5,
    comment:
      "Old coffee stains on our fabric sofa are completely gone. They explained every step and the sofa was dry by evening.",
    imageSrc: PHOTO_SOFA.src,
    createdAt: "2026-11-14T14:10:00.000Z",
  },
  {
    id: "5a1f0c1e-0001-4000-8000-000000000003",
    reviewerName: "Ayesha Rahman",
    serviceType: "Carpet & Rug Cleaning",
    rating: 5,
    comment:
      "Our living room carpet had months of dust and pet hair trapped in it. After the deep wash it looks and feels like new, and the whole room smells fresh. Highly recommended!",
    imageSrc: PHOTO_CARPET.src,
    createdAt: "2026-11-10T11:45:00.000Z",
  },
  {
    id: "5a1f0c1e-0001-4000-8000-000000000004",
    reviewerName: "Nuwan Jayasinghe",
    serviceType: "Chair & Dining Upholstery",
    rating: 5,
    comment:
      "Cleaned eight dining chairs at our home in one visit. Food marks and spills lifted out without damaging the fabric.",
    imageSrc: null,
    createdAt: "2026-11-03T16:20:00.000Z",
  },
  {
    id: "5a1f0c1e-0001-4000-8000-000000000005",
    reviewerName: "Sachini Wickramasinghe",
    serviceType: "Sofa Deep Cleaning",
    rating: 5,
    comment:
      "Our suede sofa had pet hair and muddy paw marks all over it. After the deep clean it looks and feels like new.",
    imageSrc: null,
    createdAt: "2026-10-20T10:05:00.000Z",
  },
];

const reviewMoments: Moment[] = FALLBACK_REVIEWS.filter((r) => r.imageSrc).map((r, i) => ({
  id: `5a1f0c1e-0002-4000-8000-00000000000${i + 1}`,
  imageSrc: r.imageSrc!,
  caption: null,
  sourceType: "review",
  reviewerName: r.reviewerName,
  reviewId: r.id,
  createdAt: r.createdAt,
}));

export const FALLBACK_MOMENTS: Moment[] = [
  ...reviewMoments,
  {
    id: "5a1f0c1e-0002-4000-8000-000000000004",
    imageSrc: ADMIN_SOFA.src,
    caption: "Three-seater sofa — before & after deep extraction",
    sourceType: "admin" as const,
    reviewerName: null,
    reviewId: null,
    createdAt: "2026-11-16T08:00:00.000Z",
  },
  {
    id: "5a1f0c1e-0002-4000-8000-000000000005",
    imageSrc: ADMIN_ARMCHAIR.src,
    caption: "Fresh finish on a fabric armchair",
    sourceType: "admin" as const,
    reviewerName: null,
    reviewId: null,
    createdAt: "2026-11-07T08:00:00.000Z",
  },
].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const FALLBACK_SERVICES: Service[] = DEFAULT_SERVICES.map((s, i) => ({
  id: `5a1f0c1e-0003-4000-8000-00000000000${i + 1}`,
  slug: s.id,
  title: s.title,
  shortDesc: s.shortDesc,
  highlights: [...s.highlights],
  imageSrc: MEDIA.services[s.id].src,
  sortOrder: i + 1,
  isActive: true,
}));

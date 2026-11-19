import type { inquiries, moments, reviews, services } from "@/db/schema";
import type { Inquiry, Moment, Review, Service } from "@/lib/types";

export function mapReview(row: typeof reviews.$inferSelect): Review {
  return {
    id: row.id,
    reviewerName: row.reviewerName,
    serviceType: row.serviceType,
    rating: row.rating,
    comment: row.comment,
    imageSrc: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapMoment(row: typeof moments.$inferSelect): Moment {
  return {
    id: row.id,
    imageSrc: row.imageUrl,
    caption: row.caption,
    sourceType: row.sourceType as Moment["sourceType"],
    reviewerName: row.reviewerName,
    reviewId: row.reviewId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapService(row: typeof services.$inferSelect): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDesc: row.shortDesc,
    highlights: row.highlights,
    imageSrc: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

export function mapInquiry(row: typeof inquiries.$inferSelect): Inquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    serviceType: row.serviceType,
    city: row.city,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

import type { Inquiry, Moment, Review, Service } from "@/lib/types";

export const fakeReview = (o: Partial<Review> = {}): Review => ({
  id: "review-1",
  reviewerName: "Dilini Perera",
  serviceType: "Sofa Deep Cleaning",
  rating: 5,
  comment: "Spotless sofa, thank you so much!",
  imageSrc: null,
  createdAt: "2026-11-17T09:00:00.000Z",
  ...o,
});

export const fakeMoment = (o: Partial<Moment> = {}): Moment => ({
  id: "moment-1",
  imageSrc: "https://images.unsplash.com/photo-1",
  caption: null,
  sourceType: "review",
  reviewerName: "Dilini Perera",
  reviewId: "review-1",
  createdAt: "2026-11-17T09:00:00.000Z",
  ...o,
});

export const fakeInquiry = (o: Partial<Inquiry> = {}): Inquiry => ({
  id: "inquiry-1",
  name: "Kasun",
  phone: "+94771234567",
  serviceType: "Sofa Deep Cleaning",
  city: "Kandy",
  message: "Coffee stain on seat cushion",
  createdAt: "2026-11-17T09:00:00.000Z",
  ...o,
});

export const fakeService = (o: Partial<Service> = {}): Service => ({
  id: "service-1",
  slug: "sofa-cleaning",
  title: "Sofa Deep Cleaning",
  shortDesc: "Deep extraction and stain removal.",
  highlights: ["Stain & odor removal"],
  imageSrc: null,
  sortOrder: 1,
  isActive: true,
  ...o,
});

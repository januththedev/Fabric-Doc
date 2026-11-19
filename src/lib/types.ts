export type Service = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  highlights: string[];
  imageSrc: string | null;
  sortOrder: number;
  isActive: boolean;
};
// serviceType on Review and Inquiry is the service TITLE as plain text (a snapshot), not an id.
export type Review = {
  id: string;
  reviewerName: string;
  serviceType: string;
  rating: number;
  comment: string;
  imageSrc: string | null;
  createdAt: string; // ISO (toISOString)
};
export type Moment = {
  id: string;
  imageSrc: string;
  caption: string | null;
  sourceType: "review" | "admin";
  reviewerName: string | null;
  reviewId: string | null;
  createdAt: string;
};
export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  serviceType: string;
  city: string;
  message: string;
  createdAt: string;
};
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

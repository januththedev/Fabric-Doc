import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewerName: text("reviewer_name").notNull(),
    serviceType: text("service_type").notNull(), // the service TITLE as text (a snapshot)
    rating: integer("rating").notNull().default(5),
    comment: text("comment").notNull(),
    imageUrl: text("image_url"),
    createdAt: createdAt(),
  },
  (t) => [
    check("reviews_name_check", sql`char_length(btrim(${t.reviewerName})) between 2 and 60`),
    check("reviews_service_check", sql`char_length(btrim(${t.serviceType})) between 2 and 80`),
    check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
    check("reviews_comment_check", sql`char_length(btrim(${t.comment})) between 10 and 1000`),
    check("reviews_image_url_check", sql`${t.imageUrl} is null or ${t.imageUrl} ~ '^https://'`),
    index("reviews_created_at_idx").on(t.createdAt),
  ],
);

export const moments = pgTable(
  "moments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    sourceType: text("source_type").notNull(), // 'review' | 'admin'
    reviewerName: text("reviewer_name"),
    reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    check("moments_image_url_check", sql`${t.imageUrl} ~ '^https://'`),
    check("moments_caption_check", sql`${t.caption} is null or char_length(${t.caption}) <= 140`),
    check(
      "moments_source_check",
      sql`(${t.sourceType} = 'review' and ${t.reviewId} is not null) or (${t.sourceType} = 'admin' and ${t.reviewId} is null)`,
    ),
    index("moments_created_at_idx").on(t.createdAt),
  ],
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique("services_slug_key"),
    title: text("title").notNull(),
    shortDesc: text("short_desc").notNull(),
    highlights: text("highlights").array().notNull().default(sql`'{}'::text[]`),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    check("services_slug_check", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("services_title_check", sql`char_length(btrim(${t.title})) between 2 and 80`),
    check("services_short_desc_check", sql`char_length(btrim(${t.shortDesc})) between 10 and 300`),
    check("services_highlights_check", sql`cardinality(${t.highlights}) <= 5`),
    check("services_image_url_check", sql`${t.imageUrl} is null or ${t.imageUrl} ~ '^https://'`),
    uniqueIndex("services_title_key").on(sql`lower(btrim(${t.title}))`),
    index("services_sort_idx").on(t.sortOrder, t.createdAt),
  ],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(), // E.164
    serviceType: text("service_type").notNull(), // service TITLE as text
    city: text("city").notNull(),
    message: text("message").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [
    check("inquiries_name_check", sql`char_length(btrim(${t.name})) between 2 and 60`),
    check("inquiries_phone_check", sql`${t.phone} ~ '^\\+[1-9][0-9]{7,14}$'`),
    check("inquiries_service_check", sql`char_length(btrim(${t.serviceType})) between 2 and 80`),
    check("inquiries_city_check", sql`char_length(btrim(${t.city})) between 2 and 60`),
    check("inquiries_message_check", sql`char_length(${t.message}) <= 1000`),
  ],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("rate_limits_lookup_idx").on(t.bucket, t.key, t.createdAt)],
);

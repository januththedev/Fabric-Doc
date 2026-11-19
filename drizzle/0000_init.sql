CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"service_type" text NOT NULL,
	"city" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_name_check" CHECK (char_length(btrim("inquiries"."name")) between 2 and 60),
	CONSTRAINT "inquiries_phone_check" CHECK ("inquiries"."phone" ~ '^\+[1-9][0-9]{7,14}$'),
	CONSTRAINT "inquiries_service_check" CHECK (char_length(btrim("inquiries"."service_type")) between 2 and 80),
	CONSTRAINT "inquiries_city_check" CHECK (char_length(btrim("inquiries"."city")) between 2 and 60),
	CONSTRAINT "inquiries_message_check" CHECK (char_length("inquiries"."message") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "moments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"source_type" text NOT NULL,
	"reviewer_name" text,
	"review_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moments_image_url_check" CHECK ("moments"."image_url" ~ '^https://'),
	CONSTRAINT "moments_caption_check" CHECK ("moments"."caption" is null or char_length("moments"."caption") <= 140),
	CONSTRAINT "moments_source_check" CHECK (("moments"."source_type" = 'review' and "moments"."review_id" is not null) or ("moments"."source_type" = 'admin' and "moments"."review_id" is null))
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bucket" text NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_name" text NOT NULL,
	"service_type" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_name_check" CHECK (char_length(btrim("reviews"."reviewer_name")) between 2 and 60),
	CONSTRAINT "reviews_service_check" CHECK (char_length(btrim("reviews"."service_type")) between 2 and 80),
	CONSTRAINT "reviews_rating_check" CHECK ("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_comment_check" CHECK (char_length(btrim("reviews"."comment")) between 10 and 1000),
	CONSTRAINT "reviews_image_url_check" CHECK ("reviews"."image_url" is null or "reviews"."image_url" ~ '^https://')
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"short_desc" text NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_key" UNIQUE("slug"),
	CONSTRAINT "services_slug_check" CHECK ("services"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "services_title_check" CHECK (char_length(btrim("services"."title")) between 2 and 80),
	CONSTRAINT "services_short_desc_check" CHECK (char_length(btrim("services"."short_desc")) between 10 and 300),
	CONSTRAINT "services_highlights_check" CHECK (cardinality("services"."highlights") <= 5),
	CONSTRAINT "services_image_url_check" CHECK ("services"."image_url" is null or "services"."image_url" ~ '^https://')
);
--> statement-breakpoint
ALTER TABLE "moments" ADD CONSTRAINT "moments_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moments_created_at_idx" ON "moments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rate_limits_lookup_idx" ON "rate_limits" USING btree ("bucket","key","created_at");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "services_title_key" ON "services" USING btree (lower(btrim("title")));--> statement-breakpoint
CREATE INDEX "services_sort_idx" ON "services" USING btree ("sort_order","created_at");
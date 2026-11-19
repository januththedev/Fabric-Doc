import "server-only";
import { and, asc, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { inquiries, moments, rateLimits, reviews, services } from "@/db/schema";
import type { Inquiry, Moment, Review, Service } from "@/lib/types";
import { mapInquiry, mapMoment, mapReview, mapService } from "./mappers";

/**
 * The ONLY file that talks to the database. Every function returns domain types, never raw rows.
 * Callers are responsible for authorisation (requireAdmin) before calling anything that writes.
 */

// ---------- reads ----------

export async function listReviews(limit: number): Promise<Review[]> {
  const rows = await getDb().select().from(reviews).orderBy(desc(reviews.createdAt)).limit(limit);
  return rows.map(mapReview);
}

export async function listMoments(limit: number): Promise<Moment[]> {
  const rows = await getDb().select().from(moments).orderBy(desc(moments.createdAt)).limit(limit);
  return rows.map(mapMoment);
}

export async function listServices(opts: { includeInactive: boolean }): Promise<Service[]> {
  const rows = await getDb()
    .select()
    .from(services)
    .where(opts.includeInactive ? undefined : eq(services.isActive, true))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));
  return rows.map(mapService);
}

export async function listInquiries(limit: number): Promise<Inquiry[]> {
  const rows = await getDb().select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(limit);
  return rows.map(mapInquiry);
}

// ---------- rate limiting ----------

export async function countRecentHits(bucket: string, key: string, windowSeconds: number): Promise<number> {
  const [row] = await getDb()
    .select({ n: count() })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.bucket, bucket),
        eq(rateLimits.key, key),
        gte(rateLimits.createdAt, sql`now() - make_interval(secs => ${windowSeconds})`),
      ),
    );
  return row?.n ?? 0;
}

export async function recordHit(bucket: string, key: string): Promise<void> {
  const db = getDb();
  await db.insert(rateLimits).values({ bucket, key });
  // Housekeeping: nothing older than a day is ever needed.
  await db.delete(rateLimits).where(lt(rateLimits.createdAt, sql`now() - interval '1 day'`));
}

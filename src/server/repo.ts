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

// ---------- reviews (Task 7) ----------

/** One transaction: the review, plus its Moment when it carries a photo. Guests never write Moments directly. */
export async function createReviewWithMoment(input: {
  reviewerName: string;
  serviceType: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
}): Promise<{ review: Review; moment: Moment | null }> {
  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .insert(reviews)
      .values({
        reviewerName: input.reviewerName,
        serviceType: input.serviceType,
        rating: input.rating,
        comment: input.comment,
        imageUrl: input.imageUrl,
      })
      .returning();

    let moment: Moment | null = null;
    if (input.imageUrl) {
      const [m] = await tx
        .insert(moments)
        .values({ imageUrl: input.imageUrl, sourceType: "review", reviewerName: input.reviewerName, reviewId: row.id })
        .returning();
      moment = mapMoment(m);
    }
    return { review: mapReview(row), moment };
  });
}

// ---------- inquiries (Task 9) ----------

export async function createInquiry(input: {
  name: string;
  phone: string;
  serviceType: string;
  city: string;
  message: string;
}): Promise<void> {
  await getDb().insert(inquiries).values(input);
}

// ---------- services (Task 12) ----------

export class DuplicateTitleError extends Error {
  constructor() {
    super("A service with this title already exists.");
  }
}
export class DuplicateSlugError extends Error {
  constructor() {
    super("A service with this slug already exists.");
  }
}

/** Drizzle wraps driver errors; the Postgres error (with its SQLSTATE and constraint name) is on `cause`. */
function pgError(error: unknown): { code?: string; constraint?: string } | null {
  const cause = (error as { cause?: unknown } | null)?.cause ?? error;
  return cause && typeof cause === "object" ? (cause as { code?: string; constraint?: string }) : null;
}

function rethrowUnique(error: unknown): never {
  const e = pgError(error);
  if (e?.code === "23505") {
    if (e.constraint === "services_title_key") throw new DuplicateTitleError();
    if (e.constraint === "services_slug_key") throw new DuplicateSlugError();
  }
  throw error;
}

export async function insertService(input: {
  slug: string;
  title: string;
  shortDesc: string;
  highlights: string[];
  imageUrl: string | null;
  isActive: boolean;
}): Promise<Service> {
  const db = getDb();
  try {
    const [{ top }] = await db
      .select({ top: sql<number>`coalesce(max(${services.sortOrder}), 0)` })
      .from(services);
    const [row] = await db
      .insert(services)
      .values({ ...input, sortOrder: Number(top) + 1 })
      .returning();
    return mapService(row);
  } catch (error) {
    return rethrowUnique(error);
  }
}

/** `imageUrl: undefined` keeps the current image, `null` clears it, a string replaces it. */
export async function updateServiceRow(
  id: string,
  patch: { title: string; shortDesc: string; highlights: string[]; isActive: boolean; imageUrl?: string | null },
): Promise<{ service: Service; previousImageUrl: string | null } | null> {
  const db = getDb();
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(services).where(eq(services.id, id));
      if (!existing) return null;
      const [row] = await tx
        .update(services)
        .set({
          title: patch.title,
          shortDesc: patch.shortDesc,
          highlights: patch.highlights,
          isActive: patch.isActive,
          ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
        })
        .where(eq(services.id, id))
        .returning();
      return { service: mapService(row), previousImageUrl: existing.imageUrl };
    });
  } catch (error) {
    return rethrowUnique(error);
  }
}

export async function deleteServiceRow(id: string): Promise<{ imageUrl: string | null } | null> {
  const [row] = await getDb().delete(services).where(eq(services.id, id)).returning({ imageUrl: services.imageUrl });
  return row ?? null;
}

/** Swaps a service with its neighbour, then renumbers every row 1..n so there are never ties. */
export async function moveService(id: string, direction: "up" | "down"): Promise<void> {
  await getDb().transaction(async (tx) => {
    const rows = await tx
      .select({ id: services.id })
      .from(services)
      .orderBy(asc(services.sortOrder), asc(services.createdAt));
    const from = rows.findIndex((r) => r.id === id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= rows.length) return;
    [rows[from], rows[to]] = [rows[to], rows[from]];
    for (const [index, row] of rows.entries()) {
      await tx.update(services).set({ sortOrder: index + 1 }).where(eq(services.id, row.id));
    }
  });
}

export async function setServiceActiveRow(id: string, isActive: boolean): Promise<boolean> {
  const rows = await getDb().update(services).set({ isActive }).where(eq(services.id, id)).returning({ id: services.id });
  return rows.length > 0;
}

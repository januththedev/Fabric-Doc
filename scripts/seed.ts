// Usage: npm run db:seed -- --services [--sample]
//   --services  inserts the owner's four real services (safe in production)
//   --sample    inserts INVENTED sample reviews and moments (local/staging only)
// Safe to re-run: existing rows are left alone.
// Note: this script builds its own connection because src/db/client.ts is "server-only" and cannot run under Node.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { FALLBACK_MOMENTS, FALLBACK_REVIEWS, FALLBACK_SERVICES } from "../src/data/fallback";
import * as schema from "../src/db/schema";

try {
  process.loadEnvFile(".env.local");
} catch {
  // rely on the real environment
}

const flags = new Set(process.argv.slice(2));
if (!flags.has("--services") && !flags.has("--sample")) {
  console.error("Usage: npm run db:seed -- --services [--sample]");
  process.exit(1);
}

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema });

if (flags.has("--services")) {
  const rows = await db
    .insert(schema.services)
    .values(
      FALLBACK_SERVICES.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        shortDesc: s.shortDesc,
        highlights: s.highlights,
        imageUrl: s.imageSrc,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: schema.services.id });
  console.log(`services: inserted ${rows.length} of ${FALLBACK_SERVICES.length}`);
}

if (flags.has("--sample")) {
  const reviewRows = await db
    .insert(schema.reviews)
    .values(
      FALLBACK_REVIEWS.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        serviceType: r.serviceType,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.imageSrc,
        createdAt: new Date(r.createdAt),
      })),
    )
    .onConflictDoNothing()
    .returning({ id: schema.reviews.id });
  console.log(`reviews: inserted ${reviewRows.length} of ${FALLBACK_REVIEWS.length}`);

  const momentRows = await db
    .insert(schema.moments)
    .values(
      FALLBACK_MOMENTS.map((m) => ({
        id: m.id,
        imageUrl: m.imageSrc,
        caption: m.caption,
        sourceType: m.sourceType,
        reviewerName: m.reviewerName,
        reviewId: m.reviewId,
        createdAt: new Date(m.createdAt),
      })),
    )
    .onConflictDoNothing()
    .returning({ id: schema.moments.id });
  console.log(`moments: inserted ${momentRows.length} of ${FALLBACK_MOMENTS.length}`);
}

await pool.end();

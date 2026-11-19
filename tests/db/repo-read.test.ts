import { getPool } from "@/db/client";
import { countRecentHits, listInquiries, listMoments, listReviews, listServices, recordHit } from "@/server/repo";

// Runs the REAL repo against the dedicated local test database (see vitest.db.config.mts).

const q = (text: string, values: unknown[] = []) => getPool().query(text, values);

beforeAll(() => vi.stubEnv("DATABASE_URL", process.env.DATABASE_URL ?? ""));
beforeEach(async () => {
  await q("truncate reviews, moments, services, inquiries, rate_limits restart identity cascade");
});
afterAll(async () => {
  await getPool().end();
});

const addReview = (name: string, daysAgo: number) =>
  q(
    `insert into reviews (reviewer_name, service_type, comment, created_at)
     values ($1, 'Sofa Deep Cleaning', 'A perfectly fine review.', now() - make_interval(days => $2))`,
    [name, daysAgo],
  );

const addService = (slug: string, title: string, sort: number, active = true) =>
  q(
    `insert into services (slug, title, short_desc, sort_order, is_active)
     values ($1, $2, 'A service used only in tests.', $3, $4)`,
    [slug, title, sort, active],
  );

test("listReviews is newest first and honours the limit", async () => {
  await addReview("Oldest One", 5);
  await addReview("Newest One", 1);
  await addReview("Middle One", 3);
  expect((await listReviews(10)).map((r) => r.reviewerName)).toEqual(["Newest One", "Middle One", "Oldest One"]);
  expect(await listReviews(2)).toHaveLength(2);
});

test("listMoments is newest first", async () => {
  await q(
    `insert into moments (image_url, source_type, caption, created_at) values
       ('https://x.test/old.jpg', 'admin', 'old', now() - interval '2 days'),
       ('https://x.test/new.jpg', 'admin', 'new', now() - interval '1 day')`,
  );
  expect((await listMoments(10)).map((m) => m.caption)).toEqual(["new", "old"]);
});

test("listServices hides inactive services and orders by sort_order", async () => {
  await addService("svc-b", "Service B", 2);
  await addService("svc-a", "Service A", 1);
  await addService("svc-h", "Hidden Service", 0, false);
  expect((await listServices({ includeInactive: false })).map((s) => s.title)).toEqual(["Service A", "Service B"]);
});

test("listServices({ includeInactive: true }) returns everything", async () => {
  await addService("svc-a", "Service A", 1);
  await addService("svc-h", "Hidden Service", 0, false);
  const all = await listServices({ includeInactive: true });
  expect(all.map((s) => s.title)).toEqual(["Hidden Service", "Service A"]);
  expect(all[0].isActive).toBe(false);
});

test("countRecentHits counts only hits inside the window", async () => {
  await q("insert into rate_limits (bucket, key, created_at) values ('review','1.1.1.1', now() - interval '2 hours')");
  await q("insert into rate_limits (bucket, key) values ('review','1.1.1.1'), ('review','2.2.2.2'), ('inquiry','1.1.1.1')");
  expect(await countRecentHits("review", "1.1.1.1", 3600)).toBe(1);
});

test("recordHit stores a hit and deletes hits older than a day", async () => {
  await q("insert into rate_limits (bucket, key, created_at) values ('review','1.1.1.1', now() - interval '2 days')");
  await recordHit("review", "1.1.1.1");
  const { rows } = await q("select count(*)::int as n from rate_limits");
  expect(rows[0].n).toBe(1);
  expect(await countRecentHits("review", "1.1.1.1", 3600)).toBe(1);
});

test("listInquiries is newest first", async () => {
  await q(
    `insert into inquiries (name, phone, service_type, city, created_at) values
       ('Older', '+94771234567', 'Sofa Deep Cleaning', 'Kandy', now() - interval '2 days'),
       ('Newer', '+94771234568', 'Sofa Deep Cleaning', 'Galle', now() - interval '1 day')`,
  );
  expect((await listInquiries(10)).map((i) => i.name)).toEqual(["Newer", "Older"]);
});

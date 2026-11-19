import { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

type Query = [string, unknown[]];
let c: Client;

beforeAll(async () => {
  c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
});
afterAll(async () => {
  await c.end();
});
beforeEach(async () => {
  await c.query("begin");
});
afterEach(async () => {
  await c.query("rollback");
});

/** Runs one statement that must fail. Returns its SQLSTATE and constraint, and keeps the transaction usable. */
async function failure(text: string, values: unknown[] = []) {
  await c.query("savepoint s");
  try {
    await c.query(text, values);
  } catch (e) {
    const err = e as { code: string; constraint?: string };
    await c.query("rollback to savepoint s");
    return { code: err.code, constraint: err.constraint ?? null };
  }
  await c.query("rollback to savepoint s");
  throw new Error("statement unexpectedly succeeded");
}

const reviewInsert = (over: Record<string, unknown> = {}): Query => {
  const r = {
    reviewer_name: "Dilini",
    service_type: "Sofa Deep Cleaning",
    rating: 5,
    comment: "Spotless sofa, thank you!",
    image_url: null,
    ...over,
  };
  return [
    "insert into reviews (reviewer_name, service_type, rating, comment, image_url) values ($1,$2,$3,$4,$5) returning id",
    [r.reviewer_name, r.service_type, r.rating, r.comment, r.image_url],
  ];
};

const serviceInsert = (over: Record<string, unknown> = {}): Query => {
  const s = {
    slug: "test-a",
    title: "Test Service A",
    short_desc: "A service used only in tests.",
    highlights: ["One"],
    ...over,
  };
  return [
    "insert into services (slug, title, short_desc, highlights) values ($1,$2,$3,$4) returning id",
    [s.slug, s.title, s.short_desc, s.highlights],
  ];
};

describe("reviews", () => {
  test("a valid review inserts and gets defaults", async () => {
    const { rows } = await c.query(
      "insert into reviews (reviewer_name, service_type, comment) values ('Dilini','Sofa Deep Cleaning','Spotless sofa, thank you!') returning rating, created_at",
    );
    expect(rows[0].rating).toBe(5);
    expect(rows[0].created_at).toBeInstanceOf(Date);
  });

  test.each([
    ["rating 6", { rating: 6 }, "reviews_rating_check"],
    ["1-char name", { reviewer_name: "A" }, "reviews_name_check"],
    ["9-char comment", { comment: "too short" }, "reviews_comment_check"],
    ["blank service", { service_type: "  " }, "reviews_service_check"],
    ["http image", { image_url: "http://x.test/a.jpg" }, "reviews_image_url_check"],
  ])("rejects %s", async (_label, over, constraint) => {
    expect(await failure(...reviewInsert(over))).toEqual({ code: "23514", constraint });
  });
});

describe("moments", () => {
  const reviewId = async () => (await c.query(...reviewInsert())).rows[0].id as string;
  const insertMoment = (cols: string, vals: unknown[]): Query => [
    `insert into moments (${cols}) values (${vals.map((_, i) => `$${i + 1}`).join(",")})`,
    vals,
  ];

  test("a review moment needs a review_id", async () => {
    expect(await failure(...insertMoment("image_url, source_type", ["https://x.test/a.jpg", "review"]))).toEqual({
      code: "23514",
      constraint: "moments_source_check",
    });
  });

  test("an admin moment must not have a review_id", async () => {
    const id = await reviewId();
    expect(
      await failure(...insertMoment("image_url, source_type, review_id", ["https://x.test/a.jpg", "admin", id])),
    ).toEqual({ code: "23514", constraint: "moments_source_check" });
  });

  test("a moment needs an image_url", async () => {
    expect((await failure("insert into moments (source_type) values ('admin')")).code).toBe("23502");
  });

  test("moment image_url must be https", async () => {
    expect(await failure(...insertMoment("image_url, source_type", ["http://x.test/a.jpg", "admin"]))).toEqual({
      code: "23514",
      constraint: "moments_image_url_check",
    });
  });

  test("deleting a review deletes its moment (cascade)", async () => {
    const id = await reviewId();
    await c.query(
      "insert into moments (image_url, source_type, review_id, reviewer_name) values ('https://x.test/a.jpg','review',$1,'Dilini')",
      [id],
    );
    await c.query("delete from reviews where id = $1", [id]);
    const { rows } = await c.query("select count(*)::int as n from moments where review_id = $1", [id]);
    expect(rows[0].n).toBe(0);
  });
});

describe("services", () => {
  test("titles are unique ignoring case and spacing", async () => {
    await c.query(...serviceInsert());
    expect(await failure(...serviceInsert({ slug: "test-b", title: "  test SERVICE a " }))).toEqual({
      code: "23505",
      constraint: "services_title_key",
    });
  });

  test("slugs are unique", async () => {
    await c.query(...serviceInsert());
    expect(await failure(...serviceInsert({ title: "Test Service B" }))).toEqual({
      code: "23505",
      constraint: "services_slug_key",
    });
  });

  test.each([
    ["6 highlights", { highlights: ["a1", "b2", "c3", "d4", "e5", "f6"] }, "services_highlights_check"],
    ["short description", { short_desc: "short" }, "services_short_desc_check"],
    ["bad slug", { slug: "Bad Slug" }, "services_slug_check"],
  ])("rejects %s", async (_label, over, constraint) => {
    expect(await failure(...serviceInsert(over))).toEqual({ code: "23514", constraint });
  });
});

describe("inquiries and rate limits", () => {
  const inquiry = (phone: string): [string, unknown[]] => [
    "insert into inquiries (name, phone, service_type, city) values ('Kasun', $1, 'Sofa Deep Cleaning', 'Kandy')",
    [phone],
  ];

  test("phone must be E.164", async () => {
    expect(await failure(...inquiry("0740594100"))).toEqual({ code: "23514", constraint: "inquiries_phone_check" });
    await c.query(...inquiry("+94740594100"));
  });

  test("rate_limits rows get a created_at", async () => {
    const { rows } = await c.query("insert into rate_limits (bucket, key) values ('review','1.1.1.1') returning created_at");
    expect(rows[0].created_at).toBeInstanceOf(Date);
  });
});

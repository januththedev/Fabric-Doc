import { getPool } from "@/db/client";
import { normalizePhone } from "@/lib/phone";
import { createInquiry } from "@/server/repo";

// Runs the REAL repo against the dedicated local test database (see vitest.db.config.mts).

const q = (text: string, values: unknown[] = []) => getPool().query(text, values);

beforeAll(() => vi.stubEnv("DATABASE_URL", process.env.DATABASE_URL ?? ""));
beforeEach(async () => {
  await q("truncate inquiries restart identity cascade");
});
afterAll(async () => {
  await getPool().end();
});

test("createInquiry stores the row with the normalised phone", async () => {
  const phone = normalizePhone("077 123 4567");
  expect(phone).toBe("+94771234567");

  await createInquiry({
    name: "Kasun",
    phone: phone!,
    serviceType: "Sofa Deep Cleaning",
    city: "Kandy",
    message: "Coffee stain on seat cushion",
  });

  const { rows } = await q("select name, phone, service_type, city, message from inquiries");
  expect(rows).toHaveLength(1);
  expect(rows[0]).toEqual({
    name: "Kasun",
    phone: "+94771234567",
    service_type: "Sofa Deep Cleaning",
    city: "Kandy",
    message: "Coffee stain on seat cushion",
  });
});

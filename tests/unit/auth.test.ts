// @vitest-environment node
import bcrypt from "bcryptjs";
import { verifyAdminCredentials } from "@/server/auth";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAIL", "Owner@Test.local");
  vi.stubEnv("ADMIN_PASSWORD_HASH", bcrypt.hashSync("correct horse", 4));
});
afterEach(() => vi.unstubAllEnvs());

test("the right email (any case) and password → true", async () => {
  expect(await verifyAdminCredentials("owner@test.LOCAL ", "correct horse")).toBe(true);
});

test("a wrong password → false", async () => {
  expect(await verifyAdminCredentials("owner@test.local", "wrong")).toBe(false);
});

test("a wrong email → false even with the right password", async () => {
  expect(await verifyAdminCredentials("someone@else.com", "correct horse")).toBe(false);
});

test("unset environment → false", async () => {
  vi.stubEnv("ADMIN_EMAIL", "");
  expect(await verifyAdminCredentials("owner@test.local", "correct horse")).toBe(false);
});

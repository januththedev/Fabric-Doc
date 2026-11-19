// @vitest-environment node
import { signSession, verifySession } from "@/lib/auth/session";

beforeEach(() => vi.stubEnv("AUTH_SECRET", "x".repeat(32)));
afterEach(() => vi.unstubAllEnvs());

test("round trip", async () => {
  expect(await verifySession(await signSession("owner@test.local"))).toEqual({ email: "owner@test.local" });
});

test("a tampered token is rejected", async () => {
  const token = await signSession("o@x.y");
  expect(await verifySession(token.slice(0, -2) + "xx")).toBeNull();
});

test("a token signed with another secret is rejected", async () => {
  const token = await signSession("o@x.y");
  vi.stubEnv("AUTH_SECRET", "y".repeat(32));
  expect(await verifySession(token)).toBeNull();
});

test("an expired token is rejected", async () => {
  expect(await verifySession(await signSession("o@x.y", { expiresInSeconds: -10 }))).toBeNull();
});

test.each([undefined, "", "garbage"])("a bad token (%s) gives null", async (token) => {
  expect(await verifySession(token)).toBeNull();
});

test("verifySession never throws when AUTH_SECRET is missing", async () => {
  const token = await signSession("o@x.y");
  vi.stubEnv("AUTH_SECRET", "");
  expect(await verifySession(token)).toBeNull();
});

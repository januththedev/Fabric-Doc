// @vitest-environment node
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, signOut } from "@/server/actions/auth";
import { getClientIp } from "@/server/ip";
import { takeRateLimit } from "@/server/rate-limit";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/rate-limit");
vi.mock("@/server/ip");

const jar = { set: vi.fn(), delete: vi.fn(), get: vi.fn() };

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAIL", "owner@test.local");
  vi.stubEnv("ADMIN_PASSWORD_HASH", bcrypt.hashSync("correct horse", 4));
  vi.stubEnv("AUTH_SECRET", "x".repeat(32));
  vi.mocked(cookies).mockResolvedValue(jar as never);
  vi.mocked(takeRateLimit).mockResolvedValue(true);
  vi.mocked(getClientIp).mockResolvedValue("1.1.1.1");
});
afterEach(() => {
  vi.unstubAllEnvs();
  jar.set.mockReset();
  jar.delete.mockReset();
});

test("success sets a hardened session cookie and returns ok", async () => {
  expect(await login({ email: "Owner@Test.local", password: "correct horse" })).toEqual({ ok: true, data: undefined });
  expect(jar.set).toHaveBeenCalledWith("fd_admin", expect.any(String), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 604800,
  });
});

test("a wrong password gives a generic error and no cookie", async () => {
  expect(await login({ email: "owner@test.local", password: "nope" })).toEqual({
    ok: false,
    error: "Incorrect email or password.",
  });
  expect(jar.set).not.toHaveBeenCalled();
});

test("when rate limited the credentials are not even checked", async () => {
  vi.mocked(takeRateLimit).mockResolvedValue(false);
  expect(await login({ email: "owner@test.local", password: "correct horse" })).toEqual({
    ok: false,
    error: "Too many attempts. Please try again in 15 minutes.",
  });
  expect(takeRateLimit).toHaveBeenCalledWith("login", "1.1.1.1", { max: 10, windowSeconds: 900 });
  expect(jar.set).not.toHaveBeenCalled();
});

test("not configured → clear error", async () => {
  vi.stubEnv("AUTH_SECRET", "");
  expect(await login({ email: "owner@test.local", password: "correct horse" })).toEqual({
    ok: false,
    error: "Admin sign-in is not configured.",
  });
});

test("signOut deletes the cookie and redirects to the login page", async () => {
  await signOut();
  expect(jar.delete).toHaveBeenCalledWith("fd_admin");
  expect(redirect).toHaveBeenCalledWith("/admin/login");
});

import { headers } from "next/headers";
import { getClientIp } from "@/server/ip";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

const withHeaders = (init: Record<string, string>) =>
  vi.mocked(headers).mockResolvedValue(new Headers(init) as unknown as Awaited<ReturnType<typeof headers>>);

test("takes the first x-forwarded-for entry", async () => {
  withHeaders({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
  expect(await getClientIp()).toBe("1.2.3.4");
});

test("falls back to x-real-ip", async () => {
  withHeaders({ "x-real-ip": "9.9.9.9" });
  expect(await getClientIp()).toBe("9.9.9.9");
});

test("falls back to 'unknown'", async () => {
  withHeaders({});
  expect(await getClientIp()).toBe("unknown");
});

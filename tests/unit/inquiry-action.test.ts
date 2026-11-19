import { revalidatePath } from "next/cache";
import { submitInquiry } from "@/server/actions/inquiries";
import { getClientIp } from "@/server/ip";
import { getServices } from "@/server/queries";
import { takeRateLimit } from "@/server/rate-limit";
import { createInquiry } from "@/server/repo";
import type { InquiryFormValues } from "@/lib/validation";
import { fakeService } from "./fixtures";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/repo", () => ({ createInquiry: vi.fn() }));
vi.mock("@/server/queries", () => ({ getServices: vi.fn() }));
vi.mock("@/server/rate-limit", () => ({ takeRateLimit: vi.fn() }));
vi.mock("@/server/ip", () => ({ getClientIp: vi.fn() }));

const VALID: InquiryFormValues = {
  name: "Kasun",
  phone: "077 123 4567",
  serviceType: "Sofa Deep Cleaning",
  city: "Kandy",
  message: "Coffee stain on seat cushion",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/fabric_doctor");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
  vi.mocked(getServices).mockResolvedValue([fakeService({ title: "Sofa Deep Cleaning" })]);
  vi.mocked(takeRateLimit).mockResolvedValue(true);
  vi.mocked(getClientIp).mockResolvedValue("1.1.1.1");
  vi.mocked(createInquiry).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

test("honeypot filled → generic error, repo not called", async () => {
  const result = await submitInquiry({ ...VALID, website: "https://spam.example" } as InquiryFormValues);

  expect(result).toEqual({ ok: false, error: "Something went wrong. Please try again." });
  expect(createInquiry).not.toHaveBeenCalled();
});

test("demo mode → demo error", async () => {
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");

  const result = await submitInquiry(VALID);

  expect(result).toEqual({ ok: false, error: "Demo mode: connect a database to save inquiries." });
  expect(createInquiry).not.toHaveBeenCalled();
});

test("not configured → unavailable error", async () => {
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");

  const result = await submitInquiry(VALID);

  expect(result).toEqual({ ok: false, error: "Inquiries are temporarily unavailable." });
  expect(createInquiry).not.toHaveBeenCalled();
});

test("invalid input → highlighted-fields error", async () => {
  const result = await submitInquiry({ ...VALID, phone: "123" });

  expect(result).toEqual({ ok: false, error: "Please check the highlighted fields." });
  expect(createInquiry).not.toHaveBeenCalled();
});

test("unknown service title → choose-a-service error", async () => {
  const result = await submitInquiry({ ...VALID, serviceType: "Pool Cleaning" });

  expect(result).toEqual({ ok: false, error: "Please choose a service." });
  expect(takeRateLimit).not.toHaveBeenCalled();
  expect(createInquiry).not.toHaveBeenCalled();
});

test("rate limited → rate-limit error and repo not called", async () => {
  vi.mocked(takeRateLimit).mockResolvedValue(false);

  const result = await submitInquiry(VALID);

  expect(result).toEqual({
    ok: false,
    error: "You've sent a few inquiries recently. Please try again in a while or message us on WhatsApp.",
  });
  expect(takeRateLimit).toHaveBeenCalledWith("inquiry", "1.1.1.1", { max: 5, windowSeconds: 3600 });
  expect(createInquiry).not.toHaveBeenCalled();
});

test("valid → repo called with the normalised payload and the page revalidated", async () => {
  const result = await submitInquiry(VALID);

  expect(createInquiry).toHaveBeenCalledWith({
    name: "Kasun",
    phone: "+94771234567",
    serviceType: "Sofa Deep Cleaning",
    city: "Kandy",
    message: "Coffee stain on seat cushion",
  });
  expect(revalidatePath).toHaveBeenCalledWith("/contact");
  expect(result).toEqual({ ok: true, data: undefined });
});

test("repo throws → generic error and console.error", async () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(createInquiry).mockRejectedValue(new Error("boom"));

  const result = await submitInquiry(VALID);

  expect(result).toEqual({ ok: false, error: "Something went wrong. Please try again." });
  expect(spy).toHaveBeenCalled();
});

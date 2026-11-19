import { takeRateLimit } from "@/server/rate-limit";
import { countRecentHits, recordHit } from "@/server/repo";

vi.mock("@/server/repo");

const opts = { max: 3, windowSeconds: 3600 };

beforeEach(() => vi.stubEnv("DATABASE_URL", "postgres://x"));
afterEach(() => vi.unstubAllEnvs());

test("allows and records when under the limit", async () => {
  vi.mocked(countRecentHits).mockResolvedValue(2);
  expect(await takeRateLimit("review", "1.1.1.1", opts)).toBe(true);
  expect(countRecentHits).toHaveBeenCalledWith("review", "1.1.1.1", 3600);
  expect(recordHit).toHaveBeenCalledWith("review", "1.1.1.1");
});

test("blocks and does not record at the limit", async () => {
  vi.mocked(countRecentHits).mockResolvedValue(3);
  expect(await takeRateLimit("review", "1.1.1.1", opts)).toBe(false);
  expect(recordHit).not.toHaveBeenCalled();
});

test("allows without touching the database when DATABASE_URL is unset", async () => {
  vi.stubEnv("DATABASE_URL", "");
  expect(await takeRateLimit("review", "1.1.1.1", opts)).toBe(true);
  expect(countRecentHits).not.toHaveBeenCalled();
  expect(recordHit).not.toHaveBeenCalled();
});

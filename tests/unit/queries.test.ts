import { FETCH_LIMIT } from "@/config/constants";
import { getAllServices, getMoments, getReviews, getServices } from "@/server/queries";
import { listReviews, listServices } from "@/server/repo";
import { fakeReview } from "./fixtures";

vi.mock("@/server/repo");

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
  vi.stubEnv("DATABASE_URL", "");
});
afterEach(() => vi.unstubAllEnvs());

test("demo mode returns fallback data without touching the repo", async () => {
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");
  expect(await getReviews()).toHaveLength(5);
  expect(await getMoments()).toHaveLength(5);
  expect(await getServices()).toHaveLength(4);
  expect(listReviews).not.toHaveBeenCalled();
});

test("unconfigured without demo mode returns no data", async () => {
  expect(await getReviews()).toEqual([]);
  expect(await getServices()).toEqual([]);
});

test("a configured database wins over the demo flag", async () => {
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.mocked(listReviews).mockResolvedValue([]);
  expect(await getReviews()).toEqual([]);
  expect(listReviews).toHaveBeenCalled();
});

test("configured: returns what the repo returns", async () => {
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.mocked(listReviews).mockResolvedValue([fakeReview({ id: "a" })]);
  expect((await getReviews()).map((r) => r.id)).toEqual(["a"]);
  expect(listReviews).toHaveBeenCalledWith(FETCH_LIMIT);

  vi.mocked(listServices).mockResolvedValue([]);
  await getServices();
  expect(listServices).toHaveBeenLastCalledWith({ includeInactive: false });
  await getAllServices();
  expect(listServices).toHaveBeenLastCalledWith({ includeInactive: true });
});

test("a repo error is logged and returns []", async () => {
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.mocked(listReviews).mockRejectedValue(new Error("boom"));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(await getReviews()).toEqual([]);
  expect(spy).toHaveBeenCalled();
});

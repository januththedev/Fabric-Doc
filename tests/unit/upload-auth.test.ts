import { takeRateLimit } from "@/server/rate-limit";
import { authorizeUpload } from "@/server/upload-auth";

vi.mock("@/server/rate-limit", () => ({ takeRateLimit: vi.fn() }));

const UUID = "0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b";
const ok = {
  allowedContentTypes: ["image/jpeg"],
  maximumSizeInBytes: 5 * 1024 * 1024,
  addRandomSuffix: false,
  allowOverwrite: false,
};

beforeEach(() => vi.mocked(takeRateLimit).mockResolvedValue(true));

test("a guest may upload to reviews/", async () => {
  expect(await authorizeUpload(`reviews/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).toEqual(ok);
});

test("a guest may not upload to admin/", async () => {
  await expect(authorizeUpload(`admin/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow("Not allowed");
});

test("the admin may upload to admin/ and skips the rate limit", async () => {
  expect(await authorizeUpload(`admin/${UUID}.jpg`, { isAdmin: true, ip: "1.1.1.1" })).toEqual(ok);
  expect(takeRateLimit).not.toHaveBeenCalled();
});

test.each(["reviews/../x.jpg", `reviews/${UUID}.png`, `other/${UUID}.jpg`, "reviews/short.jpg"])(
  "rejects the path %s",
  async (path) => {
    await expect(authorizeUpload(path, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow("Invalid upload path");
  },
);

test("guest uploads are rate limited", async () => {
  vi.mocked(takeRateLimit).mockResolvedValue(false);
  await expect(authorizeUpload(`reviews/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow(
    "Too many uploads. Please try again later.",
  );
  expect(takeRateLimit).toHaveBeenCalledWith("upload", "1.1.1.1", { max: 10, windowSeconds: 3600 });
});

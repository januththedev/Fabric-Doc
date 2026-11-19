import { del } from "@vercel/blob";
import { deleteBlobIfOwned } from "@/server/blob";

vi.mock("@vercel/blob", () => ({ del: vi.fn() }));

const OURS = "https://abc.public.blob.vercel-storage.com/reviews/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";

test("deletes blob URLs", async () => {
  await deleteBlobIfOwned(OURS);
  expect(del).toHaveBeenCalledWith(OURS);
});

test("ignores external URLs and null", async () => {
  await deleteBlobIfOwned("https://images.unsplash.com/photo-1");
  await deleteBlobIfOwned(null);
  expect(del).not.toHaveBeenCalled();
});

test("swallows delete errors", async () => {
  vi.mocked(del).mockRejectedValue(new Error("network"));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(deleteBlobIfOwned(OURS)).resolves.toBeUndefined();
  expect(spy).toHaveBeenCalled();
});

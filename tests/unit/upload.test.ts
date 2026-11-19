import imageCompression from "browser-image-compression";
import { upload } from "@vercel/blob/client";
import { prepareImageForUpload, uploadImage } from "@/lib/upload";

vi.mock("browser-image-compression", () => ({ default: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ upload: vi.fn() }));

const jpegOut = new File([new Uint8Array(400_000)], "out.jpg", { type: "image/jpeg" });

test("rejects non-images", async () => {
  expect(await prepareImageForUpload(new File(["x"], "a.pdf", { type: "application/pdf" }))).toEqual({
    ok: false,
    reason: "unsupported",
  });
});

test("rejects > 25 MB before compressing", async () => {
  const big = new File([new Uint8Array(26 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
  expect(await prepareImageForUpload(big)).toEqual({ ok: false, reason: "too-large" });
  expect(imageCompression).not.toHaveBeenCalled();
});

test("compresses to JPEG with fixed options", async () => {
  vi.mocked(imageCompression).mockResolvedValue(jpegOut);
  const input = new File([new Uint8Array(8_000_000)], "IMG_1.png", { type: "image/png" });
  const res = await prepareImageForUpload(input);
  expect(imageCompression).toHaveBeenCalledWith(input, {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.8,
  });
  expect(res).toEqual({ ok: true, file: expect.objectContaining({ type: "image/jpeg" }) });
});

test("a HEIC photo with an empty MIME type is attempted; a decode failure is reported", async () => {
  vi.mocked(imageCompression).mockRejectedValue(new Error("decode"));
  const heic = new File([new Uint8Array(10)], "IMG_2.HEIC", { type: "" });
  expect(await prepareImageForUpload(heic)).toEqual({ ok: false, reason: "compression-failed" });
  expect(imageCompression).toHaveBeenCalled();
});

test("output still over 5 MB is rejected", async () => {
  vi.mocked(imageCompression).mockResolvedValue(
    new File([new Uint8Array(6 * 1024 * 1024)], "o.jpg", { type: "image/jpeg" }),
  );
  expect(await prepareImageForUpload(new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" }))).toEqual({
    ok: false,
    reason: "too-large",
  });
});

test("uploadImage posts to /api/upload with a uuid jpg path and returns the url", async () => {
  vi.mocked(upload).mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/reviews/x.jpg" } as never);
  expect(await uploadImage(jpegOut, "reviews")).toEqual({
    url: "https://abc.public.blob.vercel-storage.com/reviews/x.jpg",
  });
  expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^reviews\/[0-9a-f-]{36}\.jpg$/), jpegOut, {
    access: "public",
    handleUploadUrl: "/api/upload",
    contentType: "image/jpeg",
  });
});

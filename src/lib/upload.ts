import { MAX_RAW_IMAGE_BYTES, MAX_UPLOAD_BYTES } from "@/config/constants";

export type PrepareResult =
  | { ok: true; file: File }
  | { ok: false; reason: "unsupported" | "too-large" | "compression-failed" };

export const IMAGE_ERROR_MESSAGES: Record<"unsupported" | "too-large" | "compression-failed", string> = {
  unsupported: "Please choose a JPG, PNG, WebP or HEIC photo.",
  "too-large": "That photo is too large. Please choose one under 25 MB.",
  "compression-failed": "We couldn't process this photo. Please try a JPG or PNG.",
};

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function looksSupported(file: File) {
  if (SUPPORTED_TYPES.has(file.type)) return true;
  // Some browsers report an empty type for HEIC photos from an iPhone.
  return file.type === "" && /\.(heic|heif)$/i.test(file.name);
}

/** Shrinks a phone photo to a JPEG of about 1 MB or less before upload. Never throws. */
export async function prepareImageForUpload(file: File): Promise<PrepareResult> {
  if (!looksSupported(file)) return { ok: false, reason: "unsupported" };
  if (file.size > MAX_RAW_IMAGE_BYTES) return { ok: false, reason: "too-large" };

  let compressed: File;
  try {
    // Loaded on demand: most visitors never add a photo, so they never download the compressor.
    const { default: imageCompression } = await import("browser-image-compression");
    compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8,
    });
  } catch {
    return { ok: false, reason: "compression-failed" };
  }

  if (compressed.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too-large" };
  const jpeg =
    compressed.type === "image/jpeg" ? compressed : new File([compressed], "photo.jpg", { type: "image/jpeg" });
  return { ok: true, file: jpeg };
}

/** Preview build: the photo stays in the browser (shown for this visit only). */
export async function uploadImage(file: File, folder: "reviews" | "admin"): Promise<{ url: string }> {
  void folder;
  return { url: URL.createObjectURL(file) };
}

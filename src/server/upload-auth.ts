import "server-only";
import { MAX_UPLOAD_BYTES } from "@/config/constants";
import { takeRateLimit } from "./rate-limit";

const UPLOAD_PATH = /^(reviews|admin)\/[0-9a-f-]{36}\.jpg$/;

export type UploadTokenOptions = {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix: false;
  allowOverwrite: false;
};

/**
 * Decides whether this caller may upload this exact path. Throws a readable Error when not.
 *  - only `reviews/<uuid>.jpg` (anyone) or `admin/<uuid>.jpg` (the signed-in owner)
 *  - JPEG only, 5 MB max, no overwrites
 *  - anonymous visitors are limited to 10 uploads per hour per IP
 */
export async function authorizeUpload(
  pathname: string,
  ctx: { isAdmin: boolean; ip: string },
): Promise<UploadTokenOptions> {
  const match = UPLOAD_PATH.exec(pathname);
  if (!match) throw new Error("Invalid upload path");

  if (match[1] === "admin") {
    if (!ctx.isAdmin) throw new Error("Not allowed");
  } else if (!ctx.isAdmin) {
    const allowed = await takeRateLimit("upload", ctx.ip, { max: 10, windowSeconds: 3600 });
    if (!allowed) throw new Error("Too many uploads. Please try again later.");
  }

  return {
    allowedContentTypes: ["image/jpeg"],
    maximumSizeInBytes: MAX_UPLOAD_BYTES,
    addRandomSuffix: false,
    allowOverwrite: false,
  };
}

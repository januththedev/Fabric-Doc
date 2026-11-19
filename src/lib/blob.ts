// Shared by browser and server code: pure URL checks, no secrets, no SDK.

export const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

function parse(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/** True for an https URL on a Vercel Blob public host. */
export function isBlobUrl(url: string): boolean {
  const u = parse(url);
  return Boolean(u && u.protocol === "https:" && u.hostname.endsWith(BLOB_HOST_SUFFIX));
}

/**
 * True only for one of OUR uploads: a Vercel Blob URL whose path is exactly `/<folder>/<uuid>.jpg`.
 * `new URL` resolves `..` segments first, so traversal tricks cannot reach another folder.
 */
export function isAllowedImageUrl(url: string, folder: "reviews" | "admin"): boolean {
  const u = parse(url);
  if (!u || u.protocol !== "https:" || !u.hostname.endsWith(BLOB_HOST_SUFFIX)) return false;
  return new RegExp(`^/${folder}/[0-9a-f-]{36}\\.jpg$`).test(u.pathname);
}

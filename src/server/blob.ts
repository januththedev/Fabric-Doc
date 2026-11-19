import "server-only";
import { del } from "@vercel/blob";
import { isBlobUrl } from "@/lib/blob";

/**
 * Deletes a photo from Vercel Blob when we own it. External URLs (the sample data's Unsplash photos) and null are ignored.
 * A failed delete is logged and never turns a successful database change into an error.
 */
export async function deleteBlobIfOwned(url: string | null): Promise<void> {
  if (!url || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error("[blob] delete failed", error);
  }
}

import "server-only";
import { isDbConfigured } from "@/lib/env";
import { countRecentHits, recordHit } from "./repo";

/**
 * Returns true when the caller may proceed, and records the attempt.
 * Returns false (and records nothing) once `max` attempts happened inside `windowSeconds`.
 * Without a database (demo mode) there is nothing to count, so it allows everything.
 */
export async function takeRateLimit(
  bucket: string,
  key: string,
  opts: { max: number; windowSeconds: number },
): Promise<boolean> {
  if (!isDbConfigured()) return true;
  const used = await countRecentHits(bucket, key, opts.windowSeconds);
  if (used >= opts.max) return false;
  await recordHit(bucket, key);
  return true;
}

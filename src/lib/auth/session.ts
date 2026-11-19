// Edge-safe: only `jose`, no Node APIs. Used by middleware and by server code.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "fd_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

/** A signed, expiring token for the owner. `sub` is the admin email. */
export async function signSession(email: string, opts: { expiresInSeconds?: number } = {}): Promise<string> {
  const expiresIn = opts.expiresInSeconds ?? SESSION_MAX_AGE;
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(key());
}

/** Returns the session for a valid token, or null for anything else. Never throws. */
export async function verifySession(token: string | undefined): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.sub ? { email: payload.sub } : null;
  } catch {
    return null;
  }
}

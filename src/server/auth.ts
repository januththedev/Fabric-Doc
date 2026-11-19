import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// Compared against when the email is wrong, so a wrong email and a wrong password take equally long.
const DUMMY_HASH = "$2b$12$InsuHMelF5PZLeleYyKJX.29wuBWn3s4ZaR8GbCtN/M7ix7V3IMHa";

/** Checks the single owner account defined by ADMIN_EMAIL and ADMIN_PASSWORD_HASH (bcrypt). */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return false;

  const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordMatches = await bcrypt.compare(password, emailMatches ? hash : DUMMY_HASH);
  return emailMatches && passwordMatches;
}

/** The signed-in owner, or null. Changing ADMIN_EMAIL signs out every existing session. */
export async function getAdminSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  if (session.email.toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) return null;
  return session;
}

/** Call first in every admin page and Server Action. Redirects to the login page when signed out. */
export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

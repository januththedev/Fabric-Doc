"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/session";
import { isAuthConfigured } from "@/lib/env";
import type { ActionResult } from "@/lib/types";
import { verifyAdminCredentials } from "@/server/auth";
import { getClientIp } from "@/server/ip";
import { takeRateLimit } from "@/server/rate-limit";

export async function login(values: { email: string; password: string }): Promise<ActionResult> {
  if (!isAuthConfigured()) return { ok: false, error: "Admin sign-in is not configured." };

  const allowed = await takeRateLimit("login", await getClientIp(), { max: 10, windowSeconds: 900 });
  if (!allowed) return { ok: false, error: "Too many attempts. Please try again in 15 minutes." };

  const ok = await verifyAdminCredentials(String(values.email ?? ""), String(values.password ?? ""));
  if (!ok) return { ok: false, error: "Incorrect email or password." };

  const token = await signSession(process.env.ADMIN_EMAIL!.trim().toLowerCase());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return { ok: true, data: undefined };
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// First line of defence for /admin. Every admin page and action ALSO calls requireAdmin() itself.
export async function middleware(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const configured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.AUTH_SECRET);
  const session = configured ? await verifySession(request.cookies.get(SESSION_COOKIE)?.value) : null;

  if (!session && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (session && isLogin) return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

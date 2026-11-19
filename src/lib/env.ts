// Read process.env inside each function so tests (and runtime config) can change it.

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Bundled sample data is shown only when explicitly enabled AND no database is configured. */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "1" && !isDbConfigured();
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.AUTH_SECRET);
}

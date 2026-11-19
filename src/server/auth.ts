import "server-only";

// Placeholder until Task 10 adds the real session handling. Until then nobody counts as the admin.
export async function getAdminSession(): Promise<{ email: string } | null> {
  return null;
}

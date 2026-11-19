import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Memoised on globalThis so hot reload in development doesn't leak connection pools.
const g = globalThis as unknown as { __fdPool?: Pool; __fdDb?: NodePgDatabase<typeof schema> };

export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return (g.__fdPool ??= new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 10_000 }));
}

export function getDb(): NodePgDatabase<typeof schema> {
  return (g.__fdDb ??= drizzle(getPool(), { schema }));
}

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";

const TEST_DB = "fabric_doctor_test";
const ADMIN_URL = process.env.TEST_DB_ADMIN_URL ?? "postgres://postgres:postgres@localhost:54329/postgres";

/**
 * Creates (once) and migrates a dedicated local test database, so DB tests never touch dev data
 * or a hosted Neon database. Refuses to run against anything that is not on this machine.
 */
export default async function setup() {
  const admin = new URL(ADMIN_URL);
  if (!["localhost", "127.0.0.1"].includes(admin.hostname)) {
    throw new Error("Refusing to run database tests against a non-local database.");
  }

  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  const exists = await client.query("select 1 from pg_database where datname = $1", [TEST_DB]);
  if (!exists.rowCount) await client.query(`create database ${TEST_DB}`);
  await client.end();

  const testUrl = new URL(ADMIN_URL);
  testUrl.pathname = `/${TEST_DB}`;
  const pool = new Pool({ connectionString: testUrl.toString() });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();
}

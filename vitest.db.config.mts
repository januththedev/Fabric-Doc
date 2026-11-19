import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Database tests run only against a LOCAL, dedicated test database (created by tests/db/global-setup.ts).
const TEST_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:54329/fabric_doctor_test";
if (!/^postgres(ql)?:\/\/[^@]*@(localhost|127\.0\.0\.1)[:/]/.test(TEST_URL)) {
  throw new Error("TEST_DATABASE_URL must point at a local database.");
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: { "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/db/**/*.test.ts"],
    globalSetup: ["./tests/db/global-setup.ts"],
    globals: true,
    fileParallelism: false,
    testTimeout: 20_000,
    env: { DATABASE_URL: TEST_URL, DATABASE_URL_UNPOOLED: TEST_URL },
  },
});

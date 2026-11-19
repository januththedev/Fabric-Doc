import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Empty values override .env.local, so e2e always runs in demo mode with no external services.
    env: {
      NEXT_PUBLIC_DEMO_MODE: "1",
      DATABASE_URL: "",
      BLOB_READ_WRITE_TOKEN: "",
      ADMIN_EMAIL: "",
      ADMIN_PASSWORD_HASH: "",
      AUTH_SECRET: "",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
    },
  },
});

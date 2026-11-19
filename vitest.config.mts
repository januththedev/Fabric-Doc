import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // Unit tests never need real CSS; skip the Tailwind PostCSS pipeline.
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: { "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.tsx"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    globals: true,
  },
});

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "tests/db/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["tests/e2e/**", "node_modules/**"],
    environmentMatchGlobs: [
      ["src/components/**", "happy-dom"],
      ["src/lib/**", "node"],
      ["tests/db/**", "node"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

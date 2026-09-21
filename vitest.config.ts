import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Tests for the pure logic in src/lib and for the integrity of the
 * content tables. Nothing here touches Supabase or the network.
 *
 * Two aliases matter:
 *   "@/..."       the same mapping tsconfig.json gives the app.
 *   "server-only" the real module throws unless the importer is a
 *                 React Server Component, so it is swapped for the
 *                 empty file the package itself ships for that case.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/lib/**/*.ts"],
      // Vitest hides the table when a test fails, which is exactly
      // the run whose coverage you want to look at.
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      "@": root + "src",
      "server-only": root + "node_modules/server-only/empty.js",
    },
  },
});

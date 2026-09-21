import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Contract tests against the built site, served by `next start`.
 * Needs `next build` to have been run; the script in package.json
 * does that first. See tests/api/servers.ts for the two instances.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/api/*.test.ts"],
    globalSetup: ["tests/api/servers.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // One server, one in-memory rate limiter. Parallel files would
    // race each other's buckets.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": root + "src",
      "server-only": root + "node_modules/server-only/empty.js",
    },
  },
});

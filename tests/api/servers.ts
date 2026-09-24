/**
 * Boots the built site so the API can be tested as HTTP.
 *
 * Two instances of the same production build, because the routes
 * behave differently depending on whether a database is configured and
 * both behaviours matter:
 *
 *   3311  exactly as .env.local leaves it, with no Supabase keys. This
 *         is the graceful-degradation shape: /api/donations should
 *         refuse politely rather than fall over.
 *
 *   3312  the same build told that a database exists at an address
 *         that is not listening. dbReady is then true, so every field
 *         validation in /api/donations actually runs, and a submission
 *         that gets past validation fails at the insert instead of
 *         writing a row. Nothing is created anywhere: 127.0.0.1:9 is
 *         the discard port and there is no database behind it.
 *
 * Neither instance is ever pointed at a real Supabase project.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const NEXT_BIN = join(ROOT, "node_modules", "next", "dist", "bin", "next");

export const PORT_NO_DB = 3311;
export const PORT_DB_DOWN = 3312;
export const BASE_NO_DB = `http://127.0.0.1:${PORT_NO_DB}`;
export const BASE_DB_DOWN = `http://127.0.0.1:${PORT_DB_DOWN}`;

/**
 * A third instance with one test account of each role, so the rules
 * about who may do what can be exercised over HTTP. Its database is
 * the same dead address, so an action that gets past the role check
 * fails at the database instead of changing anything.
 */
export const PORT_ROLES = 3313;
export const BASE_ROLES = `http://127.0.0.1:${PORT_ROLES}`;
export const TEST_ACCOUNTS = {
  admin: { user: "boss", password: "test-admin-phrase-only" },
  committee: { user: "comm", password: "test-committee-phrase" },
  fundraiser: { user: "fund", password: "test-fundraiser-phrase" },
  viewer: { user: "view", password: "test-viewer-phrase-only" },
} as const;

/** Invented numbers in a range no Indian mobile uses. */
export const TEST_FUNDRAISER_NUMBERS = ["5550100001", "5550100002", "5550100003"];
export const TEST_FUNDRAISER_CONTACTS = TEST_FUNDRAISER_NUMBERS.map(
  (n, i) => `fund${i}|Test Raiser ${i}|QT|${n}`,
).join(";");

const children: ChildProcess[] = [];

function start(port: number, extraEnv: Record<string, string>): ChildProcess {
  const child = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(port)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production", ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", () => {});
  child.stderr?.on("data", (b) => {
    const line = String(b);
    if (/EADDRINUSE|Error:/.test(line)) process.stderr.write(`[:${port}] ${line}`);
  });
  children.push(child);
  return child;
}

async function waitFor(base: string, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = "no attempt made";
  while (Date.now() < deadline) {
    try {
      // robots.txt is static and touches no database, so it says
      // "the server is listening" and nothing else.
      const res = await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(5_000) });
      if (!res.ok) throw new Error(`robots.txt gave ${res.status}`);
      await res.text();
      return;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new Error(`${base} never came up: ${lastError}`);
}

function stop(child: ChildProcess): void {
  if (child.pid === undefined || child.killed) return;
  if (process.platform === "win32") {
    // node's kill() leaves the server that next spawns behind.
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

export async function setup(): Promise<void> {
  start(PORT_NO_DB, {
    SUPABASE_URL: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SHEETS_WEBHOOK_URL: "",
  });
  start(PORT_DB_DOWN, {
    // Port 9 is discard. Nothing is listening and nothing is written.
    SUPABASE_URL: "http://127.0.0.1:9",
    SUPABASE_SERVICE_ROLE_KEY: "not-a-real-key-and-nothing-is-listening",
    SHEETS_WEBHOOK_URL: "",
  });
  const a = TEST_ACCOUNTS;
  start(PORT_ROLES, {
    SUPABASE_URL: "http://127.0.0.1:9",
    SUPABASE_SERVICE_ROLE_KEY: "not-a-real-key-and-nothing-is-listening",
    SHEETS_WEBHOOK_URL: "",
    AUTH_SECRET: "test-only-secret-".padEnd(64, "x"),
    ADMIN_USERS: `${a.admin.user}:${a.admin.password}`,
    COMMITTEE_USERS: `${a.committee.user}:${a.committee.password}`,
    FUNDRAISER_USERS: `${a.fundraiser.user}:${a.fundraiser.password}`,
    VIEWER_USERS: `${a.viewer.user}:${a.viewer.password}`,
    FUNDRAISER_CONTACTS: TEST_FUNDRAISER_CONTACTS,
  });
  await Promise.all([waitFor(BASE_NO_DB), waitFor(BASE_DB_DOWN), waitFor(BASE_ROLES)]);
}

export async function teardown(): Promise<void> {
  for (const c of children) stop(c);
  children.length = 0;
}

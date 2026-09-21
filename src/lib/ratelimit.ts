import "server-only";

/**
 * A small in-memory limiter.
 *
 * Honest about what it is. Each serverless instance keeps its own
 * counters, so a determined attacker spread across many instances gets
 * a multiple of the limit. It is sized for the real threat here, which
 * is one bored person on campus with a browser, and it costs nothing,
 * which matters because this site must stay free to run.
 */

type Bucket = { hits: number[]; blockedUntil: number };
const buckets = new Map<string, Bucket>();

export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";
  return `${scope}:${ip}`;
}

export function rateLimit(
  key: string,
  { max, windowMs, blockMs = 0 }: { max: number; windowMs: number; blockMs?: number },
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Cheap eviction. Without it a long-lived instance grows forever.
  if (buckets.size > 2000) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [], blockedUntil: 0 };

  if (bucket.blockedUntil > now) {
    return { ok: false, retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }

  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  // Test before counting. The old order pushed first, so a request
  // that was refused still went into the window, and anybody who did
  // what the error message told them and tried again a minute later
  // renewed their own lockout for ever. Only requests that are let
  // through are counted.
  if (bucket.hits.length >= max) {
    if (blockMs > 0) bucket.blockedUntil = now + blockMs;
    buckets.set(key, bucket);
    return {
      ok: false,
      retryAfter: Math.ceil((blockMs > 0 ? blockMs : windowMs) / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, retryAfter: 0 };
}

/** Clears a key, used after a successful login. */
export function rateLimitReset(key: string): void {
  buckets.delete(key);
}

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
  return `${scope}:${clientIp(req)}`;
}

export function rateLimit(
  key: string,
  { max, windowMs, blockMs = 0 }: { max: number; windowMs: number; blockMs?: number },
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Eviction, not a reset. clear() emptied the whole map, which meant
  // two thousand requests from two thousand forged addresses wiped
  // everybody's counters, including a live fifteen-minute login
  // lockout. Map keeps insertion order, so the oldest quarter goes and
  // anyone currently blocked stays blocked.
  if (buckets.size > 2000) {
    const drop = Math.ceil(buckets.size / 4);
    let n = 0;
    for (const k of buckets.keys()) {
      if (n++ >= drop) break;
      if (buckets.get(k)!.blockedUntil <= now) buckets.delete(k);
    }
  }

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

/**
 * For limits that should count only what went wrong, such as failed
 * sign-ins. rateLimit() counts every request it lets through, which is
 * right for a form and wrong for a login: eleven fund raisers signing
 * in correctly from the same campus Wi-Fi, which reaches us as one
 * address, must not use up anybody's allowance.
 *
 * blockedFor() looks without counting. recordFailure() counts one
 * failure and starts the block once there are too many.
 */
export function blockedFor(key: string): number {
  const bucket = buckets.get(key);
  const now = Date.now();
  if (!bucket || bucket.blockedUntil <= now) return 0;
  return Math.ceil((bucket.blockedUntil - now) / 1000);
}

export function recordFailure(
  key: string,
  { max, windowMs, blockMs }: { max: number; windowMs: number; blockMs: number },
): void {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [], blockedUntil: 0 };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  bucket.hits.push(now);
  if (bucket.hits.length >= max) {
    bucket.blockedUntil = now + blockMs;
    bucket.hits = [];
  }
  buckets.set(key, bucket);
}

/** The address a request came from, for keys that combine it with something else. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

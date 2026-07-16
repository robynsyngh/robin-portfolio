const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

type Bucket = number[];

const globalKey = "__portfolio_ai_rate_limit__";
const store: Map<string, Bucket> =
  (globalThis as Record<string, unknown>)[globalKey] instanceof Map
    ? ((globalThis as Record<string, unknown>)[globalKey] as Map<string, Bucket>)
    : new Map<string, Bucket>();
(globalThis as Record<string, unknown>)[globalKey] = store;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Simple in-memory sliding-window limiter. Good enough to stop a runaway
 * client-side loop or a scraper from burning through API budget on a
 * single-instance deployment. Not a substitute for a real limiter (e.g.
 * Upstash/Redis) under multi-instance serverless scale.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(identifier) ?? [];
  const recent = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0];
    store.set(identifier, recent);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: WINDOW_MS - (now - oldest),
    };
  }

  recent.push(now);
  store.set(identifier, recent);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - recent.length,
    retryAfterMs: 0,
  };
}

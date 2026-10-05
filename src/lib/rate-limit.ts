/**
 * Rate Limiting Middleware
 *
 * Two backends:
 *  - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *    are set — this is the production path; in-memory counters are useless on
 *    serverless because every instance has its own Map.
 *  - In-memory fallback (dev / Redis outage) — per-instance, fail-open.
 *
 * Never throws: if Redis is unreachable the in-memory limiter answers, so a
 * Redis outage cannot take the site down.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  global: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  payment: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 attempts per minute
  admin: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 attempts per minute
  booking: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 bookings per minute
  contact: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 contact submissions per minute
  webhook: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 webhooks per minute
};

/**
 * Get client identifier from request
 */
function getClientId(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";
}

// ---------------------------------------------------------------------------
// Upstash Redis backend (REST, no SDK needed)
// ---------------------------------------------------------------------------

async function checkViaRedis(
  endpoint: string,
  clientId: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfter?: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const key = `rl:${endpoint}:${clientId}`;
  const windowSec = Math.ceil(config.windowMs / 1000);

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      // Atomic fixed window: INCR, set TTL only on first hit (NX), read TTL
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(windowSec), "NX"], ["TTL", key]]),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const j: any = await res.json();
    const count = Number(j?.[0]?.result ?? 0);
    const ttl = Number(j?.[2]?.result ?? windowSec);

    if (count <= config.maxRequests) return { allowed: true };
    return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSec };
  } catch {
    return null; // Redis unreachable — fall through to in-memory
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback (per-instance)
// ---------------------------------------------------------------------------

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000); // Cleanup every minute
  // Don't hold the process open on long-lived Node servers
  (cleanupTimer as any)?.unref?.();
}

/**
 * Check if request should be rate limited.
 * Async because the Redis backend is a network call; callers must await it.
 */
export async function checkRateLimit(
  request: Request,
  endpoint: keyof typeof DEFAULT_CONFIGS,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = DEFAULT_CONFIGS[endpoint];
  const clientId = getClientId(request);

  const redisResult = await checkViaRedis(endpoint, clientId, config);
  if (redisResult) return redisResult;

  // Start the cleanup timer lazily on first use: a module-scope setInterval is
  // illegal in Cloudflare Workers' global scope (it 500s the whole worker at
  // init), and serverless runtimes only need it once requests actually flow.
  ensureCleanupTimer();

  const key = `${endpoint}:${clientId}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for authentication and payment endpoints
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

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: Request,
  endpoint: keyof typeof DEFAULT_CONFIGS
): { allowed: boolean; retryAfter?: number } {
  const clientId = getClientId(request);
  const key = `${endpoint}:${clientId}`;
  const config = DEFAULT_CONFIGS[endpoint];
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

/**
 * Cleanup expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute

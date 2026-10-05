import { supabaseAdmin } from "./auth/shopify-customer";

interface BruteForceEntry {
  attempts: number;
  lockedUntil: number | null;
}

const bruteForceStore = new Map<string, BruteForceEntry>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Check if IP/email is locked out due to brute force attempts
 */
/**
 * Cleanup expired entries periodically.
 * Started lazily on first use: a module-scope setInterval is illegal in
 * Cloudflare Workers' global scope (it 500s the whole worker at init).
 */
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of bruteForceStore.entries()) {
      if (entry.lockedUntil && now >= entry.lockedUntil) {
        bruteForceStore.delete(key);
      }
    }
  }, 60 * 1000); // Cleanup every minute
  // Don't hold the process open on long-lived Node servers
  (cleanupTimer as any)?.unref?.();
}

export function checkBruteForce(identifier: string): { allowed: boolean; lockedUntil?: number } {
  ensureCleanupTimer();
  const entry = bruteForceStore.get(identifier);
  const now = Date.now();

  if (!entry) {
    return { allowed: true };
  }

  // Check if still locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }

  // Reset if lockout expired
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    bruteForceStore.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(identifier: string): void {
  const entry = bruteForceStore.get(identifier);
  const now = Date.now();

  if (!entry) {
    bruteForceStore.set(identifier, { attempts: 1, lockedUntil: null });
    return;
  }

  entry.attempts++;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION;
    
    // Log to database for persistent tracking
    supabaseAdmin.from("security_events").insert({
      event_type: "brute_force_lockout",
      severity: "high",
      details: {
        identifier,
        attempts: entry.attempts,
        locked_until: new Date(entry.lockedUntil).toISOString(),
      },
    }).then(({ error }) => {
      if (error) console.error("Failed to log brute force event:", error);
    });
  }
}

/**
 * Reset attempts on successful login
 */
export function resetAttempts(identifier: string): void {
  bruteForceStore.delete(identifier);
}

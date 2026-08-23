/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a random CSRF token using Web Crypto API (works in browser + server)
 */
export function generateCSRFToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie");
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieHeader || !csrfHeader) {
    return false;
  }

  // Extract CSRF token from cookie
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const csrfCookie = cookies
    .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!csrfCookie) {
    return false;
  }

  // Timing-safe comparison using TextEncoder (no Node.js crypto needed)
  const enc = new TextEncoder();
  const a = enc.encode(csrfCookie);
  const b = enc.encode(csrfHeader);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

/**
 * Middleware to validate CSRF token on state-changing requests
 */
export function validateCSRF(request: Request): void {
  if (!requiresCSRFProtection(request.method)) {
    return;
  }
  
  // Skip manual validation for TanStack Start RPC endpoints
  // They are handled automatically by the createCsrfMiddleware in start.ts
  const url = new URL(request.url);
  if (url.pathname.startsWith("/_server")) {
    return;
  }

  if (!verifyCSRFToken(request)) {
    throw new Error("CSRF token validation failed");
  }
}

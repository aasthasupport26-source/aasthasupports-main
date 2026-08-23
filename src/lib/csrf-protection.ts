import crypto from "crypto";

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
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

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(csrfCookie),
    Buffer.from(csrfHeader)
  );
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

  if (!verifyCSRFToken(request)) {
    throw new Error("CSRF token validation failed");
  }
}

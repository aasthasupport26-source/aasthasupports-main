/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses
 */

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableFrameProtection?: boolean;
  enableXSSProtection?: boolean;
  enableContentTypeNosniff?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableFrameProtection: true,
  enableXSSProtection: true,
  enableContentTypeNosniff: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
};

/**
 * Generate Content Security Policy header value
 */
function getCSPHeader(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' https://checkout.razorpay.com",
    "style-src 'self'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.shopify.com https://api.razorpay.com",
    "frame-src 'self' https://api.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ];
  
  return directives.join("; ");
}

/**
 * Get all security headers as an object
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const headers: Record<string, string> = {};
  
  if (cfg.enableCSP) {
    headers["Content-Security-Policy"] = getCSPHeader();
  }
  
  if (cfg.enableHSTS) {
    // HSTS: Force HTTPS for 1 year, include subdomains
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
  
  if (cfg.enableFrameProtection) {
    // Prevent clickjacking
    headers["X-Frame-Options"] = "DENY";
  }
  
  if (cfg.enableXSSProtection) {
    // Enable browser XSS filter
    headers["X-XSS-Protection"] = "1; mode=block";
  }
  
  if (cfg.enableContentTypeNosniff) {
    // Prevent MIME type sniffing
    headers["X-Content-Type-Options"] = "nosniff";
  }
  
  if (cfg.enableReferrerPolicy) {
    // Control referrer information
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }
  
  if (cfg.enablePermissionsPolicy) {
    // Disable unnecessary browser features
    headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()";
  }
  
  // Add missing Cross-Origin headers
  headers["Cross-Origin-Embedder-Policy"] = "require-corp";
  headers["Cross-Origin-Opener-Policy"] = "same-origin";
  headers["Cross-Origin-Resource-Policy"] = "same-origin";
  
  return headers;
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
  response: Response,
  config?: SecurityHeadersConfig
): Response {
  const headers = getSecurityHeaders(config);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create a new Response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit,
  config?: SecurityHeadersConfig
): Response {
  const response = new Response(body, init);
  return applySecurityHeaders(response, config);
}

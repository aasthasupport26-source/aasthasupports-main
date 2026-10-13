/**
 * CORS Configuration
 * Strict CORS policy for API endpoints
 */

const ALLOWED_ORIGINS = [
  'https://www.aasthasupports.com',
  'https://aasthasupports.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean) as string[];

export interface CORSConfig {
  origin: string | string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS headers for response
 */
export function getCORSHeaders(origin: string | null): Record<string, string> {
  if (!isOriginAllowed(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Methods': DEFAULT_CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': DEFAULT_CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': DEFAULT_CORS_CONFIG.exposedHeaders.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': String(DEFAULT_CORS_CONFIG.maxAge),
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCORSPreflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = request.headers.get('Origin');
  if (!isOriginAllowed(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(origin),
  });
}

/**
 * Request timeout middleware
 * Prevents long-running requests from blocking resources
 */

export interface TimeoutConfig {
  timeoutMs: number;
  endpoint: string;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

const ENDPOINT_TIMEOUTS: Record<string, number> = {
  payment: 45000, // 45 seconds for payment processing
  webhook: 10000, // 10 seconds for webhooks
  admin: 60000, // 60 seconds for admin operations
  auth: 15000, // 15 seconds for authentication
  default: DEFAULT_TIMEOUT,
};

/**
 * Wrap a promise with a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Request timeout"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Get timeout for endpoint
 */
export function getEndpointTimeout(endpoint: string): number {
  return ENDPOINT_TIMEOUTS[endpoint] || DEFAULT_TIMEOUT;
}

/**
 * Create timeout controller for request
 */
export function createTimeoutController(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

// Centralized error sanitizer
export function sanitizeError(error: unknown, context?: string): Error {
  const err = error instanceof Error ? error : new Error(String(error));
  
  // Log full error server-side only
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    console.error(`[${context}]`, err);
  }
  
  // Return generic user-facing error
  return new Error("An error occurred. Please try again or contact support.");
}

export function sanitizeDbError(error: unknown, operation: string): Error {
  if (typeof window === 'undefined') {
    console.error(`Database error [${operation}]:`, error);
  }
  return new Error(`Failed to ${operation}. Please try again.`);
}

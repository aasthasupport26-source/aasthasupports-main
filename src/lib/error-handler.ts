import { captureError, captureMessage } from "./sentry";

export interface ErrorContext {
  userId?: string;
  endpoint?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 400, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", context?: ErrorContext) {
    super(message, 401, "AUTHENTICATION_ERROR", context);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", context?: ErrorContext) {
    super(message, 403, "AUTHORIZATION_ERROR", context);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", context?: ErrorContext) {
    super(message, 404, "NOT_FOUND_ERROR", context);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number, context?: ErrorContext) {
    super(`Too many requests. Try again in ${retryAfter} seconds.`, 429, "RATE_LIMIT_ERROR", context);
    this.name = "RateLimitError";
  }
}

export function handleError(error: unknown, context?: ErrorContext): { message: string; statusCode: number; code?: string } {
  if (error instanceof AppError) {
    // Log to monitoring
    if (error.statusCode >= 500) {
      captureError(error, { ...error.context, ...context });
    } else {
      captureMessage(`${error.message} | context: ${JSON.stringify({ ...error.context, ...context })}`, "warning");
    }
    
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Unknown error - log and return generic message
  captureError(error as Error, context);
  
  return {
    message: "An unexpected error occurred. Please try again.",
    statusCode: 500,
    code: "INTERNAL_ERROR",
  };
}

import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentry() {
  if (initialized) return;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️  SENTRY_DSN not configured - error tracking disabled in production!");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    // Sample 10% of transactions in production, 100% in development
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Scrub sensitive data before sending
    beforeSend(event) {
      // Remove authorization headers and cookies
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-csrf-token"];
      }

      // Remove sensitive context data
      if (event.extra) {
        delete event.extra.accessToken;
        delete event.extra.token;
        delete event.extra.password;
        delete event.extra.razorpay_signature;
      }

      return event;
    },

    // Ignore common non-critical errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Failed to fetch',
    ],
  });

  initialized = true;

  if (process.env.NODE_ENV === "production") {
    console.log("✅ Sentry error tracking initialized");
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (!initialized) {
    // Fallback to console in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error (Sentry not initialized):", error, context);
    }
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!initialized) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
    return;
  }

  Sentry.captureMessage(message, level);
}

export { Sentry };

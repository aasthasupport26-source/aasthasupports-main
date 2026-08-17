import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("SENTRY_DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
      return event;
    },
  });

  initialized = true;
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (!initialized) return;
  
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!initialized) return;
  
  Sentry.captureMessage(message, level);
}

export { Sentry };

import * as Sentry from "@sentry/react";

export function initSentryClient() {
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.["authorization"];
        }
        return event;
      },
    });
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error("Error captured:", error);
  if (process.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}

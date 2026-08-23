import * as Sentry from "@sentry/react";

export function initSentryClient() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || "development",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
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
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}

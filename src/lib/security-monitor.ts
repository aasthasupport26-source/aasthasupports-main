import { captureMessage } from "./sentry";

export interface SecurityEvent {
  type: "auth_failure" | "rate_limit" | "csrf_violation" | "invalid_signature" | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  details?: Record<string, any>;
}

const ALERT_THRESHOLDS = {
  auth_failure: 5, // Alert after 5 failed auth attempts from same IP
  rate_limit: 10, // Alert after 10 rate limit violations
  csrf_violation: 3, // Alert after 3 CSRF violations
  invalid_signature: 2, // Alert after 2 invalid signatures
  suspicious_activity: 1, // Alert immediately
};

const eventCounts = new Map<string, number>();

export function logSecurityEvent(event: SecurityEvent): void {
  const key = `${event.type}:${event.ip || event.userId || 'unknown'}`;
  const count = (eventCounts.get(key) || 0) + 1;
  eventCounts.set(key, count);

  // Log to monitoring
  captureMessage(
    `Security Event: ${event.type}`,
    event.severity === "critical" ? "error" : event.severity === "high" ? "warning" : "info",
    {
      ...event.details,
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ip: event.ip,
      endpoint: event.endpoint,
      count,
    }
  );

  // Check if we should alert
  const threshold = ALERT_THRESHOLDS[event.type];
  if (count >= threshold) {
    captureMessage(
      `SECURITY ALERT: ${event.type} threshold exceeded (${count}/${threshold})`,
      "error",
      {
        ...event.details,
        type: event.type,
        severity: event.severity,
        userId: event.userId,
        ip: event.ip,
        endpoint: event.endpoint,
        count,
        threshold,
      }
    );
  }
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  eventCounts.clear();
}, 5 * 60 * 1000);

import { createServerFn } from "@tanstack/react-start";
import { healthMonitor } from "./health-monitor";
import { requireMonitoringAuth } from "./monitoring-auth";

export const getHealthStatus = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  await requireMonitoringAuth(request);
  return healthMonitor.checkHealth();
});

export const getMetrics = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  await requireMonitoringAuth(request);
  return healthMonitor.getMetrics();
});

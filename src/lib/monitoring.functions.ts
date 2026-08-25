import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { healthMonitor } from "./health-monitor";
import { requireMonitoringAuth } from "./monitoring-auth";

export const getHealthStatus = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  await requireMonitoringAuth(request);
  return healthMonitor.checkHealth();
});

export const getMetrics = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  await requireMonitoringAuth(request);
  return healthMonitor.getMetrics();
});

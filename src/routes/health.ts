import { json } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { healthMonitor } from "@/lib/health-monitor";

export const Route = createFileRoute("/health")({
  loader: async () => {
    const health = await healthMonitor.checkHealth();
    return json(health, {
      status: health.status === "healthy" ? 200 : 503,
    });
  },
});

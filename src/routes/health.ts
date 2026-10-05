import { json } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { healthMonitor } from "@/lib/health-monitor";

export const Route = createFileRoute("/health")({
  loader: async () => {
    const health = await healthMonitor.checkHealth();
    // Return only a coarse status — detailed service names, response times and
    // dependency states must not be exposed publicly (they aid attackers).
    return json(
      { status: health.status === "healthy" ? "ok" : "degraded" },
      { status: health.status === "healthy" ? 200 : 503 },
    );
  },
});

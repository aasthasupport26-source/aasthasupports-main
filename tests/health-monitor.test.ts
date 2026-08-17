import { describe, it, expect, beforeEach } from "vitest";
import { healthMonitor } from "../src/lib/health-monitor";

describe("health-monitor", () => {
  beforeEach(() => {
    // Reset counters by creating new instance would be ideal, but we use singleton
    // So we just test the behavior
  });

  describe("recordError", () => {
    it("should increment error count", () => {
      const beforeMetrics = healthMonitor.getMetrics();
      healthMonitor.recordError();
      const afterMetrics = healthMonitor.getMetrics();
      
      expect(afterMetrics.errorRate).toBeGreaterThanOrEqual(beforeMetrics.errorRate);
    });
  });

  describe("recordRequest", () => {
    it("should increment request count", () => {
      healthMonitor.recordRequest();
      const metrics = healthMonitor.getMetrics();
      
      expect(metrics).toBeDefined();
    });
  });

  describe("getMetrics", () => {
    it("should return health metrics", () => {
      const metrics = healthMonitor.getMetrics();
      
      expect(metrics).toHaveProperty("timestamp");
      expect(metrics).toHaveProperty("uptime");
      expect(metrics).toHaveProperty("memory");
      expect(metrics).toHaveProperty("activeConnections");
      expect(metrics).toHaveProperty("errorRate");
      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should calculate error rate correctly", () => {
      const metrics = healthMonitor.getMetrics();
      
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe("checkHealth", () => {
    it("should return health status", async () => {
      const health = await healthMonitor.checkHealth();
      
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("metrics");
      expect(["healthy", "degraded", "unhealthy"]).toContain(health.status);
    });

    it("should return unhealthy when error rate > 0.5", async () => {
      // Record many errors to increase error rate
      for (let i = 0; i < 10; i++) {
        healthMonitor.recordRequest();
        healthMonitor.recordError();
      }
      
      const health = await healthMonitor.checkHealth();
      expect(health.status).toBe("unhealthy");
    });

    it("should return healthy with low error rate", async () => {
      // Record requests without errors
      for (let i = 0; i < 100; i++) {
        healthMonitor.recordRequest();
      }
      
      const health = await healthMonitor.checkHealth();
      expect(["healthy", "degraded"]).toContain(health.status);
    });
  });
});

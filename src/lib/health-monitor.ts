interface HealthMetrics {
  timestamp: number;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  activeConnections: number;
  errorRate: number;
}

class HealthMonitor {
  private errorCount = 0;
  private requestCount = 0;
  private startTime = Date.now();

  recordError() {
    this.errorCount++;
  }

  recordRequest() {
    this.requestCount++;
  }

  getMetrics(): HealthMetrics {
    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      activeConnections: 0,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
    };
  }

  async checkHealth(): Promise<{ status: "healthy" | "degraded" | "unhealthy"; metrics: HealthMetrics }> {
    const metrics = this.getMetrics();
    
    if (metrics.errorRate > 0.5) {
      return { status: "unhealthy", metrics };
    }
    
    if (metrics.errorRate > 0.2 || metrics.memory.heapUsed / metrics.memory.heapTotal > 0.9) {
      return { status: "degraded", metrics };
    }
    
    return { status: "healthy", metrics };
  }
}

export const healthMonitor = new HealthMonitor();

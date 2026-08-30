import { createServerFn } from "@tanstack/react-start";
import { performHealthCheck, getLastHealthCheck } from "./monitoring";

/**
 * Health Check Endpoint
 * Returns system health status for monitoring services
 * Cached for 30 seconds to prevent excessive checks
 */

interface ServiceHealth {
  status: 'up' | 'down' | 'unknown';
  responseTime?: number;
  error?: string;
}

const startTime = Date.now();

/**
 * Check Supabase connection
 */
async function checkDatabase(): Promise<ServiceHealth> {
  try {
    const start = Date.now();
    const { supabaseAdmin } = await import("./auth/shopify-customer");

    // Simple query to check connection
    const { error } = await supabaseAdmin
      .from("temples")
      .select("id")
      .limit(1);

    const responseTime = Date.now() - start;

    if (error) {
      return {
        status: 'down',
        error: error.message,
        responseTime,
      };
    }

    return {
      status: 'up',
      responseTime,
    };
  } catch (error: any) {
    return {
      status: 'down',
      error: error.message || 'Database connection failed',
    };
  }
}

/**
 * Check Shopify API connection
 */
async function checkShopify(): Promise<ServiceHealth> {
  try {
    const start = Date.now();
    const { shopifyClient } = await import("./shopify/client");

    // Lightweight query to check API connectivity
    const query = `{ shop { name } }`;
    const response = await shopifyClient.request(query);

    const responseTime = Date.now() - start;

    if (response && (response as any).shop) {
      return {
        status: 'up',
        responseTime,
      };
    }

    return {
      status: 'down',
      error: 'Invalid response from Shopify',
      responseTime,
    };
  } catch (error: any) {
    return {
      status: 'down',
      error: error.message || 'Shopify API connection failed',
    };
  }
}

/**
 * Check Razorpay configuration
 */
async function checkRazorpay(): Promise<ServiceHealth> {
  try {
    const { getServerEnv } = await import("./env");
    const env = getServerEnv();

    // Just check if credentials are configured
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      return {
        status: 'up',
        responseTime: 0,
      };
    }

    return {
      status: 'down',
      error: 'Razorpay credentials not configured',
    };
  } catch (error: any) {
    return {
      status: 'down',
      error: error.message || 'Razorpay check failed',
    };
  }
}

/**
 * Enhanced health check with service status
 */
export const healthCheck = createServerFn({ method: "GET" }).handler(async () => {
  const cached = getLastHealthCheck();
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached;
  }
  return performHealthCheck();
});

/**
 * Detailed health status endpoint
 */
export const getHealthStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    // Check all services in parallel
    const [database, shopify, razorpay] = await Promise.all([
      checkDatabase(),
      checkShopify(),
      checkRazorpay(),
    ]);

    const services = { database, shopify, razorpay };

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const downServices = Object.values(services).filter(s => s.status === 'down').length;

    if (downServices >= 2) {
      status = 'unhealthy';
    } else if (downServices === 1) {
      status = 'degraded';
    }

    return {
      status,
      timestamp,
      version: '1.0.0',
      services,
      uptime,
    };
  });

/**
 * Simple ping endpoint (lightweight)
 */
export const ping = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
  });

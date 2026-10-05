import { captureError, captureMessage } from "./sentry";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    database: boolean;
    razorpay: boolean;
    shopify: boolean;
  };
  timestamp: number;
}

let lastHealthCheck: HealthCheck | null = null;

export async function performHealthCheck(): Promise<HealthCheck> {
  const checks = {
    database: await checkDatabase(),
    razorpay: await checkRazorpay(),
    shopify: await checkShopify(),
  };

  const allHealthy = Object.values(checks).every(v => v);
  const someHealthy = Object.values(checks).some(v => v);

  const status = allHealthy ? "healthy" : someHealthy ? "degraded" : "unhealthy";

  const result: HealthCheck = {
    status,
    checks,
    timestamp: Date.now(),
  };

  if (status !== "healthy") {
    captureMessage(`Health check ${status}`, "warning");
  }

  lastHealthCheck = result;
  return result;
}

async function checkDatabase(): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { data, error } = await supabaseAdmin.from("users").select("id").limit(1);
    return !error;
  } catch (e) {
    captureError(e as Error, { service: "database" });
    return false;
  }
}

async function checkRazorpay(): Promise<boolean> {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

async function checkShopify(): Promise<boolean> {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
}

export function getLastHealthCheck(): HealthCheck | null {
  return lastHealthCheck;
}

// Background health polling, started lazily on first use: a module-scope
// setInterval is illegal in Cloudflare Workers' global scope (it 500s the
// whole worker at init).
let healthTimer: ReturnType<typeof setInterval> | null = null;

export function startHealthPolling(): void {
  if (healthTimer) return;
  healthTimer = setInterval(() => {
    performHealthCheck().catch(e => captureError(e, { context: "health-check-interval" }));
  }, 5 * 60 * 1000);
  (healthTimer as any)?.unref?.();
}

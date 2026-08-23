// Server-side environment variables with validation
export function getServerEnv() {
  const isNode = typeof process !== "undefined";
  const required = {
    RAZORPAY_KEY_ID: isNode ? process.env.RAZORPAY_KEY_ID : undefined,
    RAZORPAY_KEY_SECRET: isNode ? process.env.RAZORPAY_KEY_SECRET : undefined,
    RAZORPAY_WEBHOOK_SECRET: isNode ? process.env.RAZORPAY_WEBHOOK_SECRET : undefined,
    SUPABASE_URL: isNode ? process.env.SUPABASE_URL : undefined,
    SUPABASE_SERVICE_ROLE_KEY: isNode ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined,
    ADMIN_JWT_SECRET: isNode ? process.env.ADMIN_JWT_SECRET : undefined,
    SHOPIFY_STORE_DOMAIN: isNode ? process.env.SHOPIFY_STORE_DOMAIN : undefined,
    SHOPIFY_CLIENT_SECRET: isNode ? process.env.SHOPIFY_CLIENT_SECRET : undefined,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value || value === '') {
      console.error(`Missing required environment variable: ${key}`);
      throw new Error("Server configuration error. Please contact support.");
    }
  }

  return required as Record<keyof typeof required, string>;
}

// Client-safe environment variables
export function getClientEnv() {
  return {
    SHOPIFY_STORE_DOMAIN: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '',
  };
}

// Server-side environment variables with validation
export function getServerEnv() {
  const required = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
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

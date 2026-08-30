// Server-side environment variables with validation
export function getServerEnv() {
  const isNode = typeof process !== "undefined";

  if (!isNode) {
    throw new Error("getServerEnv() can only be called on the server side");
  }

  const required = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  };

  const missingVars: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value || value === '' || value.includes('your_') || value.includes('CHANGE_THIS')) {
      missingVars.push(key);
    }
  }

  // Special validation for ADMIN_JWT_SECRET - must be at least 32 characters
  if (required.ADMIN_JWT_SECRET && required.ADMIN_JWT_SECRET.length < 32) {
    console.error(`⚠️  ADMIN_JWT_SECRET must be at least 32 characters long (current: ${required.ADMIN_JWT_SECRET.length})`);
    missingVars.push('ADMIN_JWT_SECRET (too short - minimum 32 chars required)');
  }

  if (missingVars.length > 0) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚨 MISSING OR INVALID ENVIRONMENT VARIABLES:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    missingVars.forEach((varName) => {
      console.error(`   ❌ ${varName}`);
    });
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📋 ACTION REQUIRED:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Fill in all required values');
    console.error('   3. Restart the server');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw new Error(`Missing ${missingVars.length} required environment variable(s). Check console for details.`);
  }

  return required as Record<keyof typeof required, string>;
}

// Client-safe environment variables
export function getClientEnv() {
  return {
    SHOPIFY_STORE_DOMAIN:
      import.meta.env.VITE_SHOPIFY_STORE_DOMAIN ||
      import.meta.env.SHOPIFY_STORE_DOMAIN ||
      "08axwa-1x.myshopify.com",
  };
}

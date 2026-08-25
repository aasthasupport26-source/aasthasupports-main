// Environment variable validation at startup
import { z } from "zod";

const envSchema = z.object({
  // Required secrets
  ADMIN_JWT_SECRET: z.string().min(32, "ADMIN_JWT_SECRET must be at least 32 characters"),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SHOPIFY_STORE_DOMAIN: z.string().min(1),
  
  // Optional but recommended
  SHOPIFY_CLIENT_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((e: any) => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    throw error;
  }
}

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}

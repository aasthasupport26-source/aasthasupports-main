import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getServerEnv, getClientEnv } from "../src/lib/env";

describe("getServerEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.RAZORPAY_KEY_ID = "test_key";
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
    process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";
    process.env.ADMIN_JWT_SECRET = "this_is_a_test_jwt_secret_that_is_at_least_32_characters_long";
    process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
    process.env.SHOPIFY_CLIENT_SECRET = "test_client_secret";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "test_storefront_token";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "test_admin_token";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns all required env vars when present", () => {
    const env = getServerEnv();
    expect(env.RAZORPAY_KEY_ID).toBe("test_key");
    expect(env.SUPABASE_URL).toBe("https://test.supabase.co");
    expect(env.ADMIN_JWT_SECRET).toBe("this_is_a_test_jwt_secret_that_is_at_least_32_characters_long");
  });

  it("throws when required env var is missing", () => {
    delete process.env.RAZORPAY_KEY_ID;
    expect(() => getServerEnv()).toThrow("required environment variable");
  });

  it("throws when required env var is empty string", () => {
    process.env.RAZORPAY_KEY_ID = "";
    expect(() => getServerEnv()).toThrow("required environment variable");
  });

  it("throws when ADMIN_JWT_SECRET is too short", () => {
    process.env.ADMIN_JWT_SECRET = "short";
    expect(() => getServerEnv()).toThrow("required environment variable");
  });
});

describe("getClientEnv", () => {
  it("returns client-safe env vars", () => {
    const env = getClientEnv();
    expect(env).toHaveProperty("SHOPIFY_STORE_DOMAIN");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("withTransaction", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    process.env.SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "test-token";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "test-admin-token";
  });

  it("executes function and returns result", async () => {
    const { withTransaction } = await import("../src/lib/db-transaction");
    const fn = vi.fn().mockResolvedValue({ data: "test" });
    const result = await withTransaction(fn);
    expect(result).toEqual({ data: "test" });
    expect(fn).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    const { withTransaction } = await import("../src/lib/db-transaction");
    const fn = vi.fn().mockRejectedValue(new Error("DB error"));
    await expect(withTransaction(fn)).rejects.toThrow("DB error");
  });
});

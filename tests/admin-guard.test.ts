import { describe, it, expect, beforeAll } from "vitest";

describe("admin-guard", () => {
  beforeAll(() => {
    process.env.ADMIN_JWT_SECRET = "test-secret-key-for-testing-only";
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
    process.env.SUPABASE_ANON_KEY = "test-anon-key";
    process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "test-token";
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = "test-admin-token";
  });

  describe("signAdminToken", () => {
    it("should create valid admin token", async () => {
      const { signAdminToken } = await import("../src/lib/admin-guard");
      const { token, expiresAt } = signAdminToken("admin@test.com");
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
      expect(expiresAt).toBeTruthy();
      expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it("should include email in token", async () => {
      const jwt = await import("jsonwebtoken");
      const { signAdminToken } = await import("../src/lib/admin-guard");
      const { token } = signAdminToken("admin@test.com");
      
      const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!, {
        issuer: "aastha-admin"
      }) as any;
      
      expect(payload.email).toBe("admin@test.com");
      expect(payload.role).toBe("admin");
    });
  });

  describe("verifyAdminToken", () => {
    it("should verify valid admin token", async () => {
      const jwt = await import("jsonwebtoken");
      const { signAdminToken } = await import("../src/lib/admin-guard");
      const { token } = signAdminToken("admin@test.com");
      
      const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!, {
        issuer: "aastha-admin"
      }) as any;
      
      expect(payload.email).toBe("admin@test.com");
      expect(payload.role).toBe("admin");
      expect(payload.iss).toBe("aastha-admin");
    });

    it("should throw on invalid token", async () => {
      const jwt = await import("jsonwebtoken");
      expect(() => {
        jwt.verify("invalid-token", process.env.ADMIN_JWT_SECRET!, {
          issuer: "aastha-admin"
        });
      }).toThrow();
    });
  });

  describe("isAdminToken", () => {
    it("should identify admin JWT tokens", async () => {
      const mod = await import("../src/lib/admin-guard");
      const { token } = mod.signAdminToken("admin@test.com");
      expect(mod.isAdminToken(token)).toBe(true);
    });

    it("should reject Shopify tokens", async () => {
      const { isAdminToken } = await import("../src/lib/admin-guard");
      expect(isAdminToken("shcat_1234567890abcdef")).toBe(false);
    });

    it("should reject short tokens", async () => {
      const { isAdminToken } = await import("../src/lib/admin-guard");
      expect(isAdminToken("short")).toBe(false);
      expect(isAdminToken("")).toBe(false);
    });

    it("should reject non-JWT format", async () => {
      const { isAdminToken } = await import("../src/lib/admin-guard");
      expect(isAdminToken("not.a.valid.jwt.token")).toBe(false);
    });
  });
});

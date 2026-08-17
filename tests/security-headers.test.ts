import { describe, it, expect } from "vitest";
import {
  getSecurityHeaders,
  applySecurityHeaders,
  createSecureResponse,
} from "../src/lib/security-headers";

describe("getSecurityHeaders", () => {
  it("should return all default security headers", () => {
    const headers = getSecurityHeaders();
    
    expect(headers).toHaveProperty("Content-Security-Policy");
    expect(headers).toHaveProperty("Strict-Transport-Security");
    expect(headers).toHaveProperty("X-Frame-Options");
    expect(headers).toHaveProperty("X-XSS-Protection");
    expect(headers).toHaveProperty("X-Content-Type-Options");
    expect(headers).toHaveProperty("Referrer-Policy");
    expect(headers).toHaveProperty("Permissions-Policy");
  });

  it("should include CSP with required directives", () => {
    const headers = getSecurityHeaders();
    const csp = headers["Content-Security-Policy"];
    
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("should allow Razorpay in CSP", () => {
    const headers = getSecurityHeaders();
    const csp = headers["Content-Security-Policy"];
    
    expect(csp).toContain("https://checkout.razorpay.com");
    expect(csp).toContain("https://api.razorpay.com");
  });

  it("should allow Supabase and Shopify in connect-src", () => {
    const headers = getSecurityHeaders();
    const csp = headers["Content-Security-Policy"];
    
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("https://*.shopify.com");
  });

  it("should set HSTS with 1 year max-age", () => {
    const headers = getSecurityHeaders();
    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=31536000; includeSubDomains; preload"
    );
  });

  it("should set X-Frame-Options to DENY", () => {
    const headers = getSecurityHeaders();
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("should set X-Content-Type-Options to nosniff", () => {
    const headers = getSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("should allow disabling specific headers", () => {
    const headers = getSecurityHeaders({
      enableCSP: false,
      enableHSTS: false,
    });
    
    expect(headers).not.toHaveProperty("Content-Security-Policy");
    expect(headers).not.toHaveProperty("Strict-Transport-Security");
    expect(headers).toHaveProperty("X-Frame-Options");
  });
});

describe("applySecurityHeaders", () => {
  it("should add security headers to response", () => {
    const response = new Response("test");
    const secureResponse = applySecurityHeaders(response);
    
    expect(secureResponse.headers.get("X-Frame-Options")).toBe("DENY");
    expect(secureResponse.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("should return the same response object", () => {
    const response = new Response("test");
    const secureResponse = applySecurityHeaders(response);
    
    expect(secureResponse).toBe(response);
  });
});

describe("createSecureResponse", () => {
  it("should create response with security headers", () => {
    const response = createSecureResponse("test body");
    
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("should preserve response init options", () => {
    const response = createSecureResponse("test", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
    
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("text/plain");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("should allow custom security config", () => {
    const response = createSecureResponse("test", undefined, {
      enableCSP: false,
    });
    
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });
});

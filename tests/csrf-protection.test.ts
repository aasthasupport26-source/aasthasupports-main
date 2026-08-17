import { describe, it, expect } from "vitest";
import {
  generateCSRFToken,
  verifyCSRFToken,
  requiresCSRFProtection,
  validateCSRF,
} from "../src/lib/csrf-protection";

describe("generateCSRFToken", () => {
  it("should generate 64-character hex token", () => {
    const token = generateCSRFToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should generate unique tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });
});

describe("requiresCSRFProtection", () => {
  it("should require protection for state-changing methods", () => {
    expect(requiresCSRFProtection("POST")).toBe(true);
    expect(requiresCSRFProtection("PUT")).toBe(true);
    expect(requiresCSRFProtection("DELETE")).toBe(true);
    expect(requiresCSRFProtection("PATCH")).toBe(true);
  });

  it("should not require protection for safe methods", () => {
    expect(requiresCSRFProtection("GET")).toBe(false);
    expect(requiresCSRFProtection("HEAD")).toBe(false);
    expect(requiresCSRFProtection("OPTIONS")).toBe(false);
  });

  it("should be case insensitive", () => {
    expect(requiresCSRFProtection("post")).toBe(true);
    expect(requiresCSRFProtection("get")).toBe(false);
  });
});

describe("verifyCSRFToken", () => {
  it("should verify matching tokens", () => {
    const token = "test-token-123";
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        cookie: `csrf_token=${token}`,
        "x-csrf-token": token,
      },
    });
    expect(verifyCSRFToken(request)).toBe(true);
  });

  it("should reject mismatched tokens", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        cookie: "csrf_token=token1",
        "x-csrf-token": "token2",
      },
    });
    expect(verifyCSRFToken(request)).toBe(false);
  });

  it("should reject missing cookie", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        "x-csrf-token": "token",
      },
    });
    expect(verifyCSRFToken(request)).toBe(false);
  });

  it("should reject missing header", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        cookie: "csrf_token=token",
      },
    });
    expect(verifyCSRFToken(request)).toBe(false);
  });
});

describe("validateCSRF", () => {
  it("should pass for GET requests", () => {
    const request = new Request("https://example.com", { method: "GET" });
    expect(() => validateCSRF(request)).not.toThrow();
  });

  it("should throw for POST without valid token", () => {
    const request = new Request("https://example.com", { method: "POST" });
    expect(() => validateCSRF(request)).toThrow("CSRF token validation failed");
  });

  it("should pass for POST with valid token", () => {
    const token = "test-token-123";
    const request = new Request("https://example.com", {
      method: "POST",
      headers: {
        cookie: `csrf_token=${token}`,
        "x-csrf-token": token,
      },
    });
    expect(() => validateCSRF(request)).not.toThrow();
  });
});

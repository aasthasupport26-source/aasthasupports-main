import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "../src/lib/rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    // Clear rate limit store between tests
  });

  it("should allow requests within limit", () => {
    const mockRequest = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const result = checkRateLimit(mockRequest, "auth");
    expect(result.allowed).toBe(true);
  });

  it("should block requests exceeding limit", () => {
    const mockRequest = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    for (let i = 0; i < 5; i++) {
      checkRateLimit(mockRequest, "auth");
    }

    const result = checkRateLimit(mockRequest, "auth");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});

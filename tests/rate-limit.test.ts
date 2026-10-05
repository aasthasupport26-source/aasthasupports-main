import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../src/lib/rate-limit";

describe("Rate Limiting", () => {
  it("should allow requests within limit", async () => {
    const mockRequest = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const result = await checkRateLimit(mockRequest, "auth");
    expect(result.allowed).toBe(true);
  });

  it("should block requests exceeding limit", async () => {
    const mockRequest = new Request("http://localhost", {
      headers: { "x-forwarded-for": "127.0.0.2" },
    });

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(mockRequest, "auth");
    }

    const result = await checkRateLimit(mockRequest, "auth");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different clients independently", async () => {
    const a = new Request("http://localhost", { headers: { "x-forwarded-for": "10.0.0.1" } });
    const b = new Request("http://localhost", { headers: { "x-forwarded-for": "10.0.0.2" } });

    for (let i = 0; i < 6; i++) await checkRateLimit(a, "auth");
    expect((await checkRateLimit(a, "auth")).allowed).toBe(false);
    expect((await checkRateLimit(b, "auth")).allowed).toBe(true);
  });
});

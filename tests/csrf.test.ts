import { describe, it, expect } from "vitest";
import { generateCSRFToken, verifyCSRFToken } from "../src/lib/csrf-protection";

describe("CSRF Protection", () => {
  it("should generate valid token", () => {
    const token = generateCSRFToken();
    expect(token).toBeTruthy();
    expect(token.length).toBe(64);
  });

  it("should verify matching tokens", () => {
    const token = generateCSRFToken();
    const mockRequest = new Request("http://localhost", {
      method: "POST",
      headers: {
        cookie: `csrf_token=${token}`,
        "x-csrf-token": token,
      },
    });

    expect(verifyCSRFToken(mockRequest)).toBe(true);
  });

  it("should reject mismatched tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    const mockRequest = new Request("http://localhost", {
      method: "POST",
      headers: {
        cookie: `csrf_token=${token1}`,
        "x-csrf-token": token2,
      },
    });

    expect(verifyCSRFToken(mockRequest)).toBe(false);
  });
});

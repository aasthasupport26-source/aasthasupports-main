import { describe, it, expect } from "vitest";
import {
  generatePKCE,
  base64UrlEncode,
  isAllowedRedirectUri,
  getOAuthRedirectUri,
  generateRandomString,
} from "../src/lib/shopify-oauth";

describe("Shopify OAuth & PKCE Flow", () => {
  it("generates random cryptographically random string of specified length", () => {
    const s1 = generateRandomString(16);
    const s2 = generateRandomString(16);
    expect(s1).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(s2).toHaveLength(32);
    expect(s1).not.toBe(s2);
  });

  it("base64UrlEncode converts buffer to URL-safe base64 without +, / or =", () => {
    const bytes = new Uint8Array([251, 255, 254]);
    const encoded = base64UrlEncode(bytes);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("generates valid PKCE verifier and challenge", async () => {
    const { verifier, challenge } = await generatePKCE();
    expect(verifier).toBeDefined();
    expect(challenge).toBeDefined();
    expect(typeof verifier).toBe("string");
    expect(typeof challenge).toBe("string");
    expect(verifier.length).toBeGreaterThan(20);
    expect(challenge.length).toBeGreaterThan(20);
  });

  it("validates allowed redirect URIs including production domains and subdomains", () => {
    expect(isAllowedRedirectUri("https://www.aasthasupports.com/auth/callback")).toBe(true);
    expect(isAllowedRedirectUri("https://aasthasupports.com/auth/callback")).toBe(true);
    expect(isAllowedRedirectUri("http://localhost:8082/auth/callback")).toBe(true);
    expect(isAllowedRedirectUri("https://aasthasupports-git-preview.vercel.app/auth/callback")).toBe(true);
    expect(isAllowedRedirectUri("https://evil-site.com/auth/callback")).toBe(false);
    expect(isAllowedRedirectUri("https://www.aasthasupports.com/malicious")).toBe(false);
  });

  it("getOAuthRedirectUri returns proper default redirect uri", () => {
    const uri = getOAuthRedirectUri();
    expect(uri).toContain("/auth/callback");
  });
});

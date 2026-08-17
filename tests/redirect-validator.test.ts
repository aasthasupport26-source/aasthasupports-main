import { describe, it, expect } from "vitest";
import { validateRedirectUrl, sanitizeRedirect } from "../src/lib/redirect-validator";

describe("validateRedirectUrl", () => {
  it("returns true for allowed domains", () => {
    expect(validateRedirectUrl("https://aasthasupports.com/page")).toBe(true);
    expect(validateRedirectUrl("https://www.aasthasupports.com/page")).toBe(true);
    expect(validateRedirectUrl("http://localhost:3000/page")).toBe(true);
    expect(validateRedirectUrl("http://127.0.0.1:8080/page")).toBe(true);
  });

  it("returns true for subdomains of allowed domains", () => {
    expect(validateRedirectUrl("https://shop.aasthasupports.com/page")).toBe(true);
  });

  it("returns false for disallowed domains", () => {
    expect(validateRedirectUrl("https://evil.com")).toBe(false);
    expect(validateRedirectUrl("https://aasthasupports.com.evil.com")).toBe(false);
  });

  it("returns false for non-http protocols", () => {
    expect(validateRedirectUrl("javascript:alert(1)")).toBe(false);
    expect(validateRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("returns false for invalid URLs", () => {
    expect(validateRedirectUrl("not a url")).toBe(false);
    expect(validateRedirectUrl("")).toBe(false);
  });
});

describe("sanitizeRedirect", () => {
  it("allows relative paths", () => {
    expect(sanitizeRedirect("/page")).toBe("/page");
    expect(sanitizeRedirect("/admin/dashboard")).toBe("/admin/dashboard");
  });

  it("allows valid absolute URLs", () => {
    expect(sanitizeRedirect("https://aasthasupports.com/page")).toBe("https://aasthasupports.com/page");
  });

  it("blocks protocol-relative URLs", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/");
  });

  it("blocks invalid absolute URLs", () => {
    expect(sanitizeRedirect("https://evil.com")).toBe("/");
  });

  it("uses custom fallback", () => {
    expect(sanitizeRedirect("https://evil.com", "/home")).toBe("/home");
  });

  it("blocks non-slash relative paths", () => {
    expect(sanitizeRedirect("page")).toBe("/");
  });
});

import { describe, it, expect } from "vitest";
import {
  validateUserId,
  validateEmail,
  validatePhone,
  sanitizeOrderBy,
  sanitizeLimit,
  sanitizeOffset,
} from "../src/lib/db-validator";

describe("validateUserId", () => {
  it("should validate correct UUID", () => {
    expect(validateUserId("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should throw on invalid UUID", () => {
    expect(() => validateUserId("not-a-uuid")).toThrow();
    expect(() => validateUserId("")).toThrow();
  });
});

describe("validateEmail", () => {
  it("should validate correct email", () => {
    expect(validateEmail("test@example.com")).toBe("test@example.com");
  });

  it("should throw on invalid email", () => {
    expect(() => validateEmail("not-an-email")).toThrow();
    expect(() => validateEmail("")).toThrow();
  });
});

describe("validatePhone", () => {
  it("should validate correct phone numbers", () => {
    expect(validatePhone("+919876543210")).toBe("+919876543210");
    expect(validatePhone("9876543210")).toBe("9876543210");
  });

  it("should throw on invalid phone", () => {
    expect(() => validatePhone("123")).toThrow();
    expect(() => validatePhone("abc")).toThrow();
    expect(() => validatePhone("+0123456789")).toThrow();
  });
});

describe("sanitizeOrderBy", () => {
  it("should allow valid fields", () => {
    expect(sanitizeOrderBy("name", ["name", "email"])).toBe("name");
    expect(sanitizeOrderBy("email", ["name", "email"])).toBe("email");
  });

  it("should throw on invalid field", () => {
    expect(() => sanitizeOrderBy("invalid", ["name", "email"])).toThrow("Invalid order field");
  });
});

describe("sanitizeLimit", () => {
  it("should validate correct limits", () => {
    expect(sanitizeLimit(10)).toBe(10);
    expect(sanitizeLimit(50, 100)).toBe(50);
  });

  it("should throw on invalid limits", () => {
    expect(() => sanitizeLimit(0)).toThrow();
    expect(() => sanitizeLimit(-1)).toThrow();
    expect(() => sanitizeLimit(101)).toThrow();
    expect(() => sanitizeLimit(150, 100)).toThrow();
  });
});

describe("sanitizeOffset", () => {
  it("should validate correct offsets", () => {
    expect(sanitizeOffset(0)).toBe(0);
    expect(sanitizeOffset(10)).toBe(10);
  });

  it("should throw on negative offset", () => {
    expect(() => sanitizeOffset(-1)).toThrow();
  });
});

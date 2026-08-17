import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeHTML,
} from "../src/lib/input-sanitizer";

describe("sanitizeString", () => {
  it("should trim and limit string length", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
    expect(sanitizeString("a".repeat(2000), 100).length).toBe(100);
  });

  it("should remove null bytes", () => {
    expect(sanitizeString("hello\0world")).toBe("helloworld");
  });

  it("should return empty string for empty input", () => {
    expect(sanitizeString("")).toBe("");
  });
});

describe("sanitizeSearchQuery", () => {
  it("should escape SQL wildcards", () => {
    expect(sanitizeSearchQuery("test%")).toBe("test\\%");
    expect(sanitizeSearchQuery("test_")).toBe("test\\_");
  });

  it("should remove quotes and semicolons", () => {
    expect(sanitizeSearchQuery("test'query")).toBe("testquery");
    expect(sanitizeSearchQuery('test"query')).toBe("testquery");
    expect(sanitizeSearchQuery("test;query")).toBe("testquery");
  });

  it("should limit length to 100", () => {
    expect(sanitizeSearchQuery("a".repeat(200)).length).toBe(100);
  });
});

describe("sanitizeSlug", () => {
  it("should convert to lowercase and remove special chars", () => {
    expect(sanitizeSlug("Hello World!")).toBe("helloworld");
    expect(sanitizeSlug("test-slug-123")).toBe("test-slug-123");
  });

  it("should only allow alphanumeric and hyphens", () => {
    expect(sanitizeSlug("test@#$slug")).toBe("testslug");
  });

  it("should limit length to 100", () => {
    expect(sanitizeSlug("a".repeat(200)).length).toBe(100);
  });
});

describe("sanitizeEmail", () => {
  it("should convert to lowercase and trim", () => {
    expect(sanitizeEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
  });

  it("should limit length to 254", () => {
    expect(sanitizeEmail("a".repeat(300) + "@test.com").length).toBe(254);
  });
});

describe("sanitizePhone", () => {
  it("should keep only digits and plus sign", () => {
    expect(sanitizePhone("+1 (555) 123-4567")).toBe("+15551234567");
    expect(sanitizePhone("555-123-4567")).toBe("5551234567");
  });

  it("should limit length to 20", () => {
    expect(sanitizePhone("1".repeat(30)).length).toBe(20);
  });
});

describe("sanitizeNumber", () => {
  it("should parse string to number", () => {
    expect(sanitizeNumber("123")).toBe(123);
    expect(sanitizeNumber("123.45")).toBe(123.45);
  });

  it("should validate min and max", () => {
    expect(() => sanitizeNumber(5, 10, 20)).toThrow("Number must be at least 10");
    expect(() => sanitizeNumber(25, 10, 20)).toThrow("Number must be at most 20");
    expect(sanitizeNumber(15, 10, 20)).toBe(15);
  });

  it("should throw on invalid number", () => {
    expect(() => sanitizeNumber("abc")).toThrow("Invalid number");
    expect(() => sanitizeNumber(Infinity)).toThrow("Invalid number");
  });
});

describe("sanitizeHTML", () => {
  it("should remove HTML tags and escape entities", () => {
    expect(sanitizeHTML("<script>alert('xss')</script>")).toBe("alert(&#x27;xss&#x27;)");
    expect(sanitizeHTML("<p>Hello</p>")).toBe("Hello");
  });

  it("should escape HTML entities", () => {
    expect(sanitizeHTML("&<>\"'")).toBe("&amp;&quot;&#x27;");
  });

  it("should limit length to 10000", () => {
    expect(sanitizeHTML("a".repeat(20000)).length).toBe(10000);
  });
});

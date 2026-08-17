import { describe, it, expect } from "vitest";
import { isValidUUID, validateUUID, uuidSchema } from "@/lib/uuid-validator";

describe("uuid-validator", () => {
  describe("isValidUUID", () => {
    it("returns true for valid UUIDs", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
      expect(isValidUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
    });

    it("returns false for invalid UUIDs", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("")).toBe(false);
      expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
    });
  });

  describe("validateUUID", () => {
    it("returns UUID for valid input", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(validateUUID(uuid)).toBe(uuid);
    });

    it("throws for invalid UUID", () => {
      expect(() => validateUUID("invalid")).toThrow("Invalid UUID format");
    });
  });

  describe("uuidSchema", () => {
    it("parses valid UUIDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(uuidSchema.parse(uuid)).toBe(uuid);
    });

    it("throws for invalid UUIDs", () => {
      expect(() => uuidSchema.parse("invalid")).toThrow();
    });
  });
});

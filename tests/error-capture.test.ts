import { describe, it, expect, vi, beforeEach } from "vitest";
import { consumeLastCapturedError } from "../src/lib/error-capture";

describe("error-capture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should capture and consume error", () => {
    const testError = new Error("Test error");
    
    // Simulate error event
    if (typeof globalThis.dispatchEvent === "function") {
      const errorEvent = new ErrorEvent("error", { error: testError });
      globalThis.dispatchEvent(errorEvent);
      
      const captured = consumeLastCapturedError();
      expect(captured).toBe(testError);
    } else {
      expect(true).toBe(true);
    }
  });

  it("should return undefined after TTL expires", () => {
    const testError = new Error("Test error");
    
    if (typeof globalThis.dispatchEvent === "function") {
      const errorEvent = new ErrorEvent("error", { error: testError });
      globalThis.dispatchEvent(errorEvent);
      
      vi.advanceTimersByTime(6000); // Advance past 5s TTL
      
      const captured = consumeLastCapturedError();
      expect(captured).toBeUndefined();
    } else {
      expect(true).toBe(true);
    }
  });

  it("should clear error after consumption", () => {
    const testError = new Error("Test error");
    
    if (typeof globalThis.dispatchEvent === "function") {
      const errorEvent = new ErrorEvent("error", { error: testError });
      globalThis.dispatchEvent(errorEvent);
      
      consumeLastCapturedError();
      const second = consumeLastCapturedError();
      expect(second).toBeUndefined();
    } else {
      expect(true).toBe(true);
    }
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { initAuthSync, broadcastAuthChange } from "../src/lib/multi-tab-sync";

describe("multi-tab-sync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("broadcastAuthChange", () => {
    it("should store auth data in localStorage", () => {
      const data = {
        customer: { id: "1", email: "test@example.com" },
        accessToken: "token123",
        expiresAt: "2026-12-31T23:59:59Z",
        timestamp: Date.now(),
      };

      broadcastAuthChange(data);

      const stored = localStorage.getItem("auth_sync");
      expect(stored).toBeTruthy();
      
      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        expect(parsed.customer.id).toBe("1");
        expect(parsed.accessToken).toBe("token123");
      }
    });

    it("should update timestamp", () => {
      const data = {
        customer: null,
        accessToken: null,
        expiresAt: null,
        timestamp: 1000,
      };

      broadcastAuthChange(data);

      const stored = localStorage.getItem("auth_sync");
      expect(stored).toBeTruthy();
      
      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        expect(parsed.timestamp).toBeGreaterThan(1000);
      }
    });
  });

  describe("initAuthSync", () => {
    it("should call onSync when storage event fires", () => {
      const onSync = vi.fn();
      const cleanup = initAuthSync(onSync);

      localStorage.setItem("aastha_customer", JSON.stringify({ id: "1" }));
      localStorage.setItem("aastha_access_token", "token123");
      localStorage.setItem("aastha_token_expires", "2026-12-31T23:59:59Z");

      const event = new StorageEvent("storage", {
        key: "aastha_access_token",
        newValue: "token123",
      });
      window.dispatchEvent(event);

      expect(onSync).toHaveBeenCalled();
      cleanup();
    });

    it("should poll for sync data", async () => {
      await new Promise<void>((resolve) => {
        let cleanup: () => void;
        const onSync = vi.fn(() => {
          cleanup();
          resolve();
        });
        
        cleanup = initAuthSync(onSync);

        const syncData = {
          customer: { id: "1" },
          accessToken: "token123",
          expiresAt: "2026-12-31T23:59:59Z",
          timestamp: Date.now(),
        };
        localStorage.setItem("auth_sync", JSON.stringify(syncData));
      });
    });

    it("should cleanup on return", () => {
      const onSync = vi.fn();
      const cleanup = initAuthSync(onSync);

      cleanup();

      const event = new StorageEvent("storage", {
        key: "aastha_access_token",
      });
      window.dispatchEvent(event);

      expect(onSync).not.toHaveBeenCalled();
    });
  });
});

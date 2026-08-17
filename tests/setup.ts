import { vi } from "vitest";

// Use a real in-memory localStorage implementation
const storage = new Map<string, string>();

global.localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
  length: 0,
  key: vi.fn(),
};

global.BroadcastChannel = class BroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(message: any) {}
  close() {}
} as any;

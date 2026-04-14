import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Cleanup React tree after each test
afterEach(() => {
  cleanup();
});

// Stub window.alert / confirm which TNPM pages call
beforeAll(() => {
  globalThis.alert = vi.fn();
  globalThis.confirm = vi.fn(() => true);
  globalThis.matchMedia =
    globalThis.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any));

  // Stub ResizeObserver used by chart libs
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    (class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any);

  // Stub crypto.randomUUID if not in jsdom
  if (!globalThis.crypto) {
    globalThis.crypto = {} as any;
  }
  if (!(globalThis.crypto as any).randomUUID) {
    (globalThis.crypto as any).randomUUID = () =>
      "00000000-0000-4000-8000-000000000000";
  }
});

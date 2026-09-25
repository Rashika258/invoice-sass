import "@testing-library/jest-dom/vitest";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Mock window.matchMedia for theme toggle and responsive hooks
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Mock ResizeObserver
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock as any;

  // Mock IntersectionObserver
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = IntersectionObserverMock as any;

  // Mock scrollTo
  window.scrollTo = (() => {}) as any;
}

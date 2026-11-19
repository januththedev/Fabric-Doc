import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// next/image needs the Next runtime; in unit tests render a plain <img> with the Next-only props removed.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, quality, placeholder, blurDataURL, loader, unoptimized, ...rest } = props;
    void [fill, priority, sizes, quality, placeholder, blurDataURL, loader, unoptimized];
    return createElement("img", rest);
  },
}));

// jsdom has no IntersectionObserver (used by motion's whileInView). A no-op stand-in is enough for unit tests.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

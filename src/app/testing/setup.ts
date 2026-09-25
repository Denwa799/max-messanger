import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  // Учётные данные хранятся в cookie — чистим между тестами, чтобы они не протекали.
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=')[0];
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
});

// jsdom не реализует эти браузерные API, а компоненты MAX UI и виртуализатор их вызывают.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverStub;
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

Element.prototype.scrollTo = () => {};
window.scrollTo = () => {};

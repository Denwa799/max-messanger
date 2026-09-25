import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCookieStorage } from './storage';

const getCookie = (name: string): string | undefined =>
  document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);

/**
 * jsdom не отдаёт атрибуты cookie (Path, SameSite, Secure, Max-Age) при чтении
 * `document.cookie`, поэтому перехватываем сам вызов присваивания.
 */
const withCookieCapture = (run: (writes: string[]) => void): void => {
  const writes: string[] = [];
  const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => descriptor?.get?.call(document) as string,
    set: (value: string) => {
      writes.push(value);
      descriptor?.set?.call(document, value);
    },
  });

  try {
    run(writes);
  } finally {
    Reflect.deleteProperty(document, 'cookie');
  }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createCookieStorage', () => {
  it('бросает ошибку вне браузера', () => {
    vi.stubGlobal('document', undefined);

    expect(() => createCookieStorage()).toThrow(
      'Cookie storage is unavailable outside the browser',
    );
  });

  it('возвращает null, если cookie не задана', () => {
    const storage = createCookieStorage();

    expect(storage.getItem('missing')).toBeNull();
  });

  it('записывает и читает значение', () => {
    const storage = createCookieStorage();

    storage.setItem('token', 'abc');

    expect(storage.getItem('token')).toBe('abc');
  });

  it('кодирует значение при записи', () => {
    const storage = createCookieStorage();

    storage.setItem('json', '{"a":"б в"}');

    expect(getCookie('json')).toBe(encodeURIComponent('{"a":"б в"}'));
  });

  it('декодирует значение при чтении', () => {
    document.cookie = `encoded=${encodeURIComponent('значение с пробелами')}; Path=/`;
    const storage = createCookieStorage();

    expect(storage.getItem('encoded')).toBe('значение с пробелами');
  });

  it('возвращает null на повреждённом percent-кодировании', () => {
    document.cookie = 'broken=%E0%A4%A; Path=/';
    const storage = createCookieStorage();

    expect(storage.getItem('broken')).toBeNull();
  });

  it('удаляет значение, обнуляя Max-Age', () => {
    withCookieCapture((writes) => {
      const storage = createCookieStorage();

      storage.removeItem('token');

      expect(writes[0]).toContain('token=');
      expect(writes[0]).toContain('Max-Age=0');
    });
  });

  it('не ставит флаг Secure при http', () => {
    withCookieCapture((writes) => {
      const storage = createCookieStorage();

      storage.setItem('token', 'abc');

      expect(writes[0]).toContain('SameSite=Lax');
      expect(writes[0]).toContain('Path=/');
      expect(writes[0]).not.toContain('Secure');
    });
  });

  it('ставит флаг Secure при https', () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { protocol: 'https:' },
    });

    try {
      withCookieCapture((writes) => {
        const storage = createCookieStorage();

        storage.setItem('token', 'abc');

        expect(writes[0]).toContain('Secure');
      });
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    }
  });
});

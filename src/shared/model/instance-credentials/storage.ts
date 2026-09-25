import type { StateStorage } from 'zustand/middleware';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 год

const readCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return null;
  }
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number): void => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (window.location.protocol === 'https:') parts.push('Secure');

  document.cookie = parts.join('; ');
};

export const createCookieStorage = (): StateStorage => {
  if (typeof document === 'undefined') {
    throw new Error('Cookie storage is unavailable outside the browser');
  }

  return {
    getItem: (name) => readCookie(name),
    setItem: (name, value) => writeCookie(name, value, COOKIE_MAX_AGE_SECONDS),
    removeItem: (name) => writeCookie(name, '', 0),
  };
};

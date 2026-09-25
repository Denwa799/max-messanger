import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'max-instance-credentials';

/** Пишет в cookie то, что persisted-стор ожидает прочитать: `{ state, version }`. */
const writePersistedState = (state: unknown, version = 0): void => {
  const value = JSON.stringify({ state, version });
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(value)}; Path=/`;
};

beforeEach(() => {
  // Стор гидратируется из cookie в момент импорта модуля, поэтому перед каждым тестом
  // сбрасываем кеш модулей и подгружаем стор заново.
  vi.resetModules();
});

describe('гидратация стора учётных данных', () => {
  it('подхватывает сохранённые учётные данные', async () => {
    writePersistedState({ idInstance: '1101000000', apiTokenInstance: 'token' });

    const { useInstanceCredentialsStore } = await import('./store');

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '1101000000',
      apiTokenInstance: 'token',
    });
  });

  it('игнорирует повреждённый JSON и остаётся пустым', async () => {
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent('{не json')}; Path=/`;

    const { useInstanceCredentialsStore } = await import('./store');

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '',
      apiTokenInstance: '',
    });
  });

  it('игнорирует данные, не прошедшие схему', async () => {
    writePersistedState({ idInstance: '1' });

    const { useInstanceCredentialsStore } = await import('./store');

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '',
      apiTokenInstance: '',
    });
  });

  it('остаётся пустым, когда cookie нет', async () => {
    const { useInstanceCredentialsStore } = await import('./store');

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '',
      apiTokenInstance: '',
    });
  });
});

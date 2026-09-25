import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearInstanceCredentials,
  getInstanceCredentials,
  useInstanceCredentials,
  useInstanceCredentialsStore,
  useIsInstanceConfigured,
} from './store';

const STORAGE_KEY = 'max-instance-credentials';

beforeEach(() => {
  clearInstanceCredentials();
});

describe('useInstanceCredentialsStore', () => {
  it('по умолчанию пуст', () => {
    const state = useInstanceCredentialsStore.getState();

    expect(state.idInstance).toBe('');
    expect(state.apiTokenInstance).toBe('');
  });

  it('обрезает пробелы при сохранении', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '  1 ', apiTokenInstance: ' token ' });

    const state = useInstanceCredentialsStore.getState();
    expect(state.idInstance).toBe('1');
    expect(state.apiTokenInstance).toBe('token');
  });

  it('сохраняет учётные данные в cookie', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    expect(document.cookie).toContain(STORAGE_KEY);
  });

  it('сбрасывает учётные данные', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    useInstanceCredentialsStore.getState().resetCredentials();

    const state = useInstanceCredentialsStore.getState();
    expect(state.idInstance).toBe('');
    expect(state.apiTokenInstance).toBe('');
  });
});

describe('getInstanceCredentials', () => {
  it('возвращает актуальные учётные данные вне React', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    expect(getInstanceCredentials()).toEqual({ idInstance: '1', apiTokenInstance: 'token' });
  });
});

describe('clearInstanceCredentials', () => {
  it('очищает стор и хранилище', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    clearInstanceCredentials();

    expect(getInstanceCredentials()).toEqual({ idInstance: '', apiTokenInstance: '' });
    expect(document.cookie).not.toContain(`${STORAGE_KEY}=`);
  });
});

describe('useIsInstanceConfigured', () => {
  it('false, пока не заданы оба поля', () => {
    const { result } = renderHook(() => useIsInstanceConfigured());

    expect(result.current).toBe(false);
  });

  it('true, когда заданы idInstance и apiTokenInstance', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    const { result } = renderHook(() => useIsInstanceConfigured());

    expect(result.current).toBe(true);
  });
});

describe('useInstanceCredentials', () => {
  it('отдаёт пару полей', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    const { result } = renderHook(() => useInstanceCredentials());

    expect(result.current).toEqual({ idInstance: '1', apiTokenInstance: 'token' });
  });
});

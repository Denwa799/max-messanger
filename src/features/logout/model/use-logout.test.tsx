import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMessagesStore } from '@entities/message';
import { useInstanceCredentialsStore } from '@shared/model';

import { useLogout } from './use-logout';

let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  queryClient = new QueryClient();
});

describe('useLogout', () => {
  it('очищает учётные данные, сообщения и кеш запросов', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    useMessagesStore
      .getState()
      .addMessage({ id: 'm1', chatId: 'c1', text: 'Привет', isOutgoing: false, timestamp: 1 });
    queryClient.setQueryData(['max', '1', 'getChats'], [{ chatId: 'c1' }]);

    const { result } = renderHook(() => useLogout(), { wrapper });
    act(() => result.current());

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '',
      apiTokenInstance: '',
    });
    expect(useMessagesStore.getState().messagesByChat).toEqual({});
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('возвращает устойчивый колбэк между рендерами', () => {
    const { result, rerender } = renderHook(() => useLogout(), { wrapper });
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstanceCredentialsStore } from '@shared/model';

import { createMaxQuery } from './create-max-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  useInstanceCredentialsStore.getState().resetCredentials();
});

describe('createMaxQuery', () => {
  it('строит queryOptions с ключом инстанса и queryFn', () => {
    const queryFn = vi.fn().mockResolvedValue('data');
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], queryFn);

    const options = query.queryOptions('1');

    expect(options.queryKey).toEqual(['key', '1']);
    expect(options.queryFn).toBe(queryFn);
  });

  it('передаёт overrides в queryOptions', () => {
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], vi.fn());

    const options = query.queryOptions('1', { staleTime: 1234 });

    expect(options.staleTime).toBe(1234);
  });

  it('не выполняет запрос, пока инстанс не подключён', () => {
    const queryFn = vi.fn().mockResolvedValue('data');
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], queryFn);

    const { result } = renderHook(() => query.useQuery(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(queryFn).not.toHaveBeenCalled();
  });

  it('выполняет запрос, когда инстанс подключён', async () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    const queryFn = vi.fn().mockResolvedValue('data');
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], queryFn);

    const { result } = renderHook(() => query.useQuery(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toBe('data'));
    expect(queryFn).toHaveBeenCalledOnce();
  });

  it('включает запрос при появлении учётных данных', async () => {
    const queryFn = vi.fn().mockResolvedValue('data');
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], queryFn);

    const { result } = renderHook(() => query.useQuery(), { wrapper: createWrapper() });
    expect(queryFn).not.toHaveBeenCalled();

    act(() => {
      useInstanceCredentialsStore
        .getState()
        .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    });

    await waitFor(() => expect(result.current.data).toBe('data'));
  });

  it('не включает запрос, если вызывающий код передал enabled: false', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    const queryFn = vi.fn().mockResolvedValue('data');
    const query = createMaxQuery((idInstance: string) => ['key', idInstance], queryFn);

    const { result } = renderHook(() => query.useQuery({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(queryFn).not.toHaveBeenCalled();
  });
});

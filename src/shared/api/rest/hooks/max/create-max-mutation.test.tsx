import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createMaxMutation } from './create-max-mutation';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('createMaxMutation', () => {
  it('сохраняет mutationKey и mutationFn в options', () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const mutation = createMaxMutation(['key'], mutationFn);

    expect(mutation.mutationKey).toEqual(['key']);
    expect(mutation.mutationOptions().mutationKey).toEqual(['key']);
    expect(mutation.mutationOptions().mutationFn).toBe(mutationFn);
  });

  it('вызывает mutationFn с переданными переменными', async () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const mutation = createMaxMutation<{ result: string }, { id: string }>(['key'], mutationFn);

    const { result } = renderHook(() => mutation.useMutation(), { wrapper });
    act(() => {
      result.current.mutate({ id: '1' });
    });

    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(mutationFn.mock.calls[0][0]).toEqual({ id: '1' });
  });

  it('пробрасывает ошибку мутации', async () => {
    const error = new Error('boom');
    const mutation = createMaxMutation(['key'], vi.fn().mockRejectedValue(error));

    const { result } = renderHook(() => mutation.useMutation(), { wrapper });
    act(() => {
      result.current.mutate(undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});

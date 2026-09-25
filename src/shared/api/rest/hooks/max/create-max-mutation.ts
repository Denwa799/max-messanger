import { mutationOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import type { MaxApiError } from '../../client';

export const createMaxMutation = <TData, TVariables>(
  mutationKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  type Options = Omit<
    UseMutationOptions<TData, MaxApiError, TVariables>,
    'mutationFn' | 'mutationKey'
  >;

  const options = () =>
    mutationOptions<TData, MaxApiError, TVariables>({ mutationKey, mutationFn });

  return {
    mutationKey,
    mutationOptions: options,
    useMutation: (overrides?: Options) => useMutation({ ...options(), ...overrides }),
  };
};

import { queryOptions, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

import type { MaxApiError } from '../../client';

/**
 * Собирает `queryOptions` и хук для GET-запроса MAX API. Держит `queryKey` и `queryFn`
 * в одном месте, чтобы их можно было переиспользовать вне React (префетч, инвалидация)
 * и при этом не дублировать в каждом хуке.
 */
export const createMaxQuery = <TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
) => {
  type Options = Omit<UseQueryOptions<TData, MaxApiError, TData>, 'queryKey' | 'queryFn'>;

  const options = () => queryOptions<TData, MaxApiError>({ queryKey, queryFn });

  return {
    queryKey,
    queryOptions: options,
    useQuery: (overrides?: Options) => useQuery({ ...options(), ...overrides }),
  };
};

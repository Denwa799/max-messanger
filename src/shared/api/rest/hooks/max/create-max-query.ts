import { queryOptions, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

import { useInstanceCredentials } from '@shared/model';

import type { MaxApiError } from '../../client';

type QueryOverrides<TData> = Omit<
  UseQueryOptions<TData, MaxApiError, TData>,
  'queryKey' | 'queryFn'
>;

/**
 * Собирает `queryOptions` и хук для GET-запроса MAX API. Ключ строится из `idInstance`,
 * поэтому кеш каждого инстанса хранится отдельно, а учётные данные `queryFn` читает из стора
 * в момент запроса. Держит `queryKey` и `queryFn` в одном месте, чтобы их можно было
 * переиспользовать вне React (префетч, инвалидация) и не дублировать в каждом хуке.
 */
export const createMaxQuery = <TData>(
  queryKey: (idInstance: string) => readonly unknown[],
  queryFn: () => Promise<TData>,
) => {
  const options = (idInstance: string, overrides?: QueryOverrides<TData>) =>
    queryOptions<TData, MaxApiError>({
      queryKey: queryKey(idInstance),
      queryFn,
      ...overrides,
    });

  return {
    queryKey,
    queryOptions: options,
    useQuery: (overrides?: QueryOverrides<TData>) => {
      const { idInstance } = useInstanceCredentials();
      const { enabled, ...rest } = overrides ?? {};

      // Пока инстанс не подключён, запрос отправлять некуда — держим его выключенным
      // независимо от того, что передал вызывающий код.
      return useQuery({
        ...options(idInstance),
        ...rest,
        enabled: idInstance.length > 0 && (enabled ?? true),
      });
    },
  };
};

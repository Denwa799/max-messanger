/**
 * Префикс ключей запросов MAX API. `idInstance` стоит прямо в ключе, поэтому кеш каждого
 * инстанса хранится отдельно и данные одного аккаунта не показываются в другом.
 */
export const maxQueryKey = (idInstance: string, ...parts: readonly unknown[]) =>
  ['max', idInstance, ...parts] as const;

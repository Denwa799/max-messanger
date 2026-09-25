import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import { getInstanceCredentials } from '@shared/model';

import type { MaxApiError } from '../../client';
import { MaxService } from '../../services/max';
import type { GetChatHistoryResponse } from '../../services/max/types';

/** Шаг выгрузки истории: сколько сообщений запрашиваем за одну страницу. */
export const CHAT_HISTORY_PAGE_SIZE = 100;

/** Предельная глубина истории MAX: глубже 5000 сообщений или 3 месяцев сервер их не отдаёт. */
export const CHAT_HISTORY_MAX_DEPTH = 5000;

export const maxGetChatHistoryQueryKey = (chatId: string) =>
  ['max', 'getChatHistory', chatId] as const;

/**
 * История чата в виде бесконечной ленты. У метода `getChatHistory` нет курсора — только
 * `chatId` и `count`, и ответ всегда начинается с самых свежих сообщений. Поэтому за шаг
 * увеличиваем `count` на `CHAT_HISTORY_PAGE_SIZE` и отрезаем от ответа уже загруженный
 * «хвост»: так страницы не дублируют друг друга и в кеше оседает только новое.
 */
export const maxGetChatHistoryQueryOptions = (chatId: string, enabled = true) =>
  infiniteQueryOptions<
    GetChatHistoryResponse,
    MaxApiError,
    InfiniteData<GetChatHistoryResponse>,
    ReturnType<typeof maxGetChatHistoryQueryKey>,
    number
  >({
    queryKey: maxGetChatHistoryQueryKey(chatId),
    queryFn: async ({ pageParam }) => {
      const messages = await MaxService.getChatHistory({
        ...getInstanceCredentials(),
        chatId,
        count: pageParam,
      });

      return messages.slice(pageParam - CHAT_HISTORY_PAGE_SIZE);
    },
    initialPageParam: CHAT_HISTORY_PAGE_SIZE,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      // Неполная страница означает, что история закончилась.
      if (lastPage.length < CHAT_HISTORY_PAGE_SIZE) return undefined;

      const nextPageParam = lastPageParam + CHAT_HISTORY_PAGE_SIZE;
      return nextPageParam > CHAT_HISTORY_MAX_DEPTH ? undefined : nextPageParam;
    },
    enabled,
    // Свежие сообщения приходят уведомлениями, поэтому историю не перезапрашиваем на каждый
    // возврат к чату и по фокусу окна — иначе бесконечная лента тянулась бы заново целиком.
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

export const useMaxGetChatHistory = (chatId: string, enabled = true) =>
  useInfiniteQuery(maxGetChatHistoryQueryOptions(chatId, enabled));

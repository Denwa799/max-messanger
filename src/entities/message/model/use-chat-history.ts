import { useMemo } from 'react';

import { useMaxGetChatHistory } from '@shared/api';
import type { MaxApiError } from '@shared/api';
import { useIsInstanceConfigured } from '@shared/model';

import { mapApiMessage } from './map-api-message';
import type { ChatMessage } from './types';

export interface ChatHistory {
  messages: ChatMessage[];
  /** Идёт первая загрузка истории. */
  isPending: boolean;
  isError: boolean;
  error: MaxApiError | null;
  /** Есть ли ещё более старые сообщения, которые можно подгрузить. */
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

/**
 * История чата: последние сообщения и подгрузка более старых страниц. Живые сообщения
 * (из уведомлений) сюда не входят — их складывает `useMessagesSync`, объединяет
 * `useConversationMessages`.
 */
export const useChatHistory = (chatId: string): ChatHistory => {
  const isConfigured = useIsInstanceConfigured();
  const query = useMaxGetChatHistory(chatId, isConfigured);

  const messages = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flat()
        .map(mapApiMessage)
        // Нетекстовые сообщения маппинг отбрасывает — оставляем только текст.
        .filter((message): message is ChatMessage => message !== null),
    [query.data],
  );

  return {
    messages,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    retry: () => void query.refetch(),
  };
};

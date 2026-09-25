import { useMemo } from 'react';

import { mergeMessages } from './merge-messages';
import { useChatMessages, useDeletedMessageIds, useEditedTextById } from './store';
import type { ChatHistory } from './use-chat-history';
import { useChatHistory } from './use-chat-history';
import type { ChatMessage } from './types';

export interface Conversation extends Omit<ChatHistory, 'messages'> {
  messages: ChatMessage[];
}

/**
 * Сообщения чата для отображения: история из API плюс живые уведомления. Поверх объединённого
 * списка накладываем правки из уведомлений — удалённые скрываем, отредактированным подменяем
 * текст. Один и тот же патч так работает и для стора, и для кеша истории.
 */
export const useConversationMessages = (chatId: string): Conversation => {
  const history = useChatHistory(chatId);
  const live = useChatMessages(chatId);
  const deletedMessageIds = useDeletedMessageIds();
  const editedTextById = useEditedTextById();

  const messages = useMemo(
    () =>
      mergeMessages(history.messages, live)
        .filter((message) => !deletedMessageIds[message.id])
        .map((message) => {
          const editedText = editedTextById[message.id];
          return editedText === undefined ? message : { ...message, text: editedText };
        }),
    [history.messages, live, deletedMessageIds, editedTextById],
  );

  return { ...history, messages };
};

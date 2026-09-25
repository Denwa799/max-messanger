import { useMemo } from 'react';

import { mergeMessages } from './merge-messages';
import type { ChatHistory } from './use-chat-history';
import { useChatHistory } from './use-chat-history';
import { useChatMessages } from './store';
import type { ChatMessage } from './types';

export interface Conversation extends Omit<ChatHistory, 'messages'> {
  messages: ChatMessage[];
}

/** Сообщения чата для отображения: история из API плюс живые уведомления. */
export const useConversationMessages = (chatId: string): Conversation => {
  const history = useChatHistory(chatId);
  const live = useChatMessages(chatId);

  const messages = useMemo(() => mergeMessages(history.messages, live), [history.messages, live]);

  return { ...history, messages };
};

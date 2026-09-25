import { create } from 'zustand';

import type { ChatMessage } from './types';

interface MessagesState {
  messagesByChat: Record<string, ChatMessage[]>;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

const EMPTY_MESSAGES: ChatMessage[] = [];

export const useMessagesStore = create<MessagesState>()((set) => ({
  messagesByChat: {},
  addMessage: (message) =>
    set((state) => {
      const current = state.messagesByChat[message.chatId] ?? [];

      // Уведомление может продублировать уже показанное сообщение (например, эхо отправленного),
      // поэтому сообщения с тем же idMessage повторно не добавляем.
      if (current.some((item) => item.id === message.id)) return state;

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [message.chatId]: [...current, message].sort((a, b) => a.timestamp - b.timestamp),
        },
      };
    }),
  reset: () => set({ messagesByChat: {} }),
}));

export const useChatMessages = (chatId: string): ChatMessage[] =>
  useMessagesStore((state) => state.messagesByChat[chatId] ?? EMPTY_MESSAGES);

export const addMessage = (message: ChatMessage): void => {
  useMessagesStore.getState().addMessage(message);
};

export const resetMessages = (): void => {
  useMessagesStore.getState().reset();
};

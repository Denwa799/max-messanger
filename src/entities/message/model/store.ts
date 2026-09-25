import { create } from 'zustand';

import type { ChatMessage } from './types';

interface MessagesState {
  messagesByChat: Record<string, ChatMessage[]>;
  /** id удалённых сообщений — по ним скрываем сообщение и в сторе, и в кеше истории. */
  deletedMessageIds: Record<string, true>;
  /** Новый текст отредактированных сообщений по id — перекрывает живое сообщение и историю. */
  editedTextById: Record<string, string>;
  addMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
  editMessage: (messageId: string, text: string) => void;
  reset: () => void;
}

const EMPTY_MESSAGES: ChatMessage[] = [];

export const useMessagesStore = create<MessagesState>()((set) => ({
  messagesByChat: {},
  deletedMessageIds: {},
  editedTextById: {},
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
  // Удалённое сообщение не убираем из messagesByChat, а помечаем: id приходит один раз, а
  // сообщение может лежать и в сторе, и в кеше истории. Фильтруем при отображении.
  removeMessage: (messageId) =>
    set((state) =>
      state.deletedMessageIds[messageId]
        ? state
        : { deletedMessageIds: { ...state.deletedMessageIds, [messageId]: true } },
    ),
  editMessage: (messageId, text) =>
    set((state) =>
      state.editedTextById[messageId] === text
        ? state
        : { editedTextById: { ...state.editedTextById, [messageId]: text } },
    ),
  reset: () => set({ messagesByChat: {}, deletedMessageIds: {}, editedTextById: {} }),
}));

export const useChatMessages = (chatId: string): ChatMessage[] =>
  useMessagesStore((state) => state.messagesByChat[chatId] ?? EMPTY_MESSAGES);

/** id удалённых сообщений — по ним отфильтровываем и живые сообщения, и историю. */
export const useDeletedMessageIds = (): Record<string, true> =>
  useMessagesStore((state) => state.deletedMessageIds);

/** Новый текст отредактированных сообщений — накладываем поверх живого сообщения и истории. */
export const useEditedTextById = (): Record<string, string> =>
  useMessagesStore((state) => state.editedTextById);

export const addMessage = (message: ChatMessage): void => {
  useMessagesStore.getState().addMessage(message);
};

export const resetMessages = (): void => {
  useMessagesStore.getState().reset();
};

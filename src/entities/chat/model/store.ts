import { create } from 'zustand';

import type { Chat } from './types';

interface ChatsState {
  /** Чаты, добавленные вручную (например, по номеру телефона), до их появления в GetChats. */
  addedChats: Chat[];
  addChat: (chat: Chat) => void;
  reset: () => void;
}

export const useChatsStore = create<ChatsState>()((set) => ({
  addedChats: [],
  addChat: (chat) =>
    set((state) => ({
      addedChats: state.addedChats.some((item) => item.id === chat.id)
        ? state.addedChats
        : [...state.addedChats, chat],
    })),
  reset: () => set({ addedChats: [] }),
}));

export const useAddedChats = (): Chat[] => useChatsStore((state) => state.addedChats);

/** Запоминает чат, которого ещё нет в ответе GetChats. */
export const addChat = (chat: Chat): void => {
  useChatsStore.getState().addChat(chat);
};

export const resetChats = (): void => {
  useChatsStore.getState().reset();
};

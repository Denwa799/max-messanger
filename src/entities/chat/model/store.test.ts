import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Chat } from './types';
import { addChat, resetChats, useAddedChats, useChatsStore } from './store';

const makeChat = (overrides: Partial<Chat> = {}): Chat => ({
  id: 'c1',
  title: 'Иван',
  ...overrides,
});

beforeEach(() => {
  resetChats();
});

describe('useChatsStore.addChat', () => {
  it('добавляет чат', () => {
    addChat(makeChat());

    expect(useChatsStore.getState().addedChats).toHaveLength(1);
  });

  it('не добавляет чат с существующим id', () => {
    addChat(makeChat({ id: 'dup', title: 'Первый' }));
    addChat(makeChat({ id: 'dup', title: 'Второй' }));

    expect(useChatsStore.getState().addedChats).toHaveLength(1);
    expect(useChatsStore.getState().addedChats[0].title).toBe('Первый');
  });

  it('сохраняет порядок добавления', () => {
    addChat(makeChat({ id: 'a' }));
    addChat(makeChat({ id: 'b' }));

    expect(useChatsStore.getState().addedChats.map((chat) => chat.id)).toEqual(['a', 'b']);
  });
});

describe('useChatsStore.reset', () => {
  it('очищает список добавленных чатов', () => {
    addChat(makeChat());

    resetChats();

    expect(useChatsStore.getState().addedChats).toEqual([]);
  });
});

describe('useAddedChats', () => {
  it('возвращает добавленные чаты', () => {
    addChat(makeChat({ id: 'a' }));

    const { result } = renderHook(() => useAddedChats());

    expect(result.current.map((chat) => chat.id)).toEqual(['a']);
  });
});

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMaxGetChats } from '@shared/api';
import type { Chat as ApiChat } from '@shared/api';

import { addChat, resetChats } from './store';
import { useChats } from './use-chats';

vi.mock('@shared/api', () => ({ useMaxGetChats: vi.fn() }));

const setQueryData = (chats: ApiChat[] | undefined, extra: Record<string, unknown> = {}) => {
  vi.mocked(useMaxGetChats).mockReturnValue({
    data: chats,
    ...extra,
  } as unknown as ReturnType<typeof useMaxGetChats>);
};

beforeEach(() => {
  resetChats();
  setQueryData(undefined);
});

describe('useChats', () => {
  it('отображает чаты из GetChats в доменной модели', () => {
    setQueryData([{ chatId: 'c1', name: 'Иван', type: 'user', phoneNumber: 79991234567 }]);

    const { result } = renderHook(() => useChats());

    expect(result.current.chats).toEqual([
      { id: 'c1', title: 'Иван', type: 'user', subtitle: '+79991234567' },
    ]);
  });

  it('возвращает пустой список, пока нет ответа', () => {
    const { result } = renderHook(() => useChats());

    expect(result.current.chats).toEqual([]);
  });

  it('добавляет чаты, которых ещё нет в ответе GetChats', () => {
    setQueryData([{ chatId: 'c1', name: 'Иван', type: 'user', phoneNumber: 0 }]);
    addChat({ id: 'c2', title: '+79990000000' });

    const { result } = renderHook(() => useChats());

    expect(result.current.chats.map((chat) => chat.id)).toEqual(['c1', 'c2']);
  });

  it('не дублирует чат, который уже пришёл из GetChats', () => {
    setQueryData([{ chatId: 'c1', name: 'Иван', type: 'user', phoneNumber: 0 }]);
    addChat({ id: 'c1', title: 'Дубликат' });

    const { result } = renderHook(() => useChats());

    expect(result.current.chats).toHaveLength(1);
    expect(result.current.chats[0].title).toBe('Иван');
  });

  it('ставит добавленные вручную чаты после серверных', () => {
    setQueryData([{ chatId: 'c1', name: 'A', type: 'user', phoneNumber: 0 }]);
    addChat({ id: 'c2', title: 'B' });
    addChat({ id: 'c3', title: 'C' });

    const { result } = renderHook(() => useChats());

    expect(result.current.chats.map((chat) => chat.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('пробрасывает поля запроса наружу', () => {
    setQueryData(undefined, { isPending: true, isError: false });

    const { result } = renderHook(() => useChats());

    expect(result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});

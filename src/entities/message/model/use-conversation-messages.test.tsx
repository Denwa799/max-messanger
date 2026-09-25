import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMaxGetChatHistory } from '@shared/api';
import type { ChatHistoryMessage } from '@shared/api';

import { addMessage, resetMessages, useMessagesStore } from './store';
import { useConversationMessages } from './use-conversation-messages';

vi.mock('@shared/api', () => ({ useMaxGetChatHistory: vi.fn() }));

const setHistory = (pages: ChatHistoryMessage[][], extra: Record<string, unknown> = {}): void => {
  vi.mocked(useMaxGetChatHistory).mockReturnValue({
    data: { pages },
    isPending: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...extra,
  } as unknown as ReturnType<typeof useMaxGetChatHistory>);
};

const historyMessage = (overrides: Partial<ChatHistoryMessage> = {}): ChatHistoryMessage => ({
  type: 'incoming',
  idMessage: 'h1',
  timestamp: 100,
  typeMessage: 'textMessage',
  chatId: 'c1',
  textMessage: 'Из истории',
  ...overrides,
});

beforeEach(() => {
  resetMessages();
  setHistory([]);
});

describe('useConversationMessages', () => {
  it('маппит историю и отбрасывает нетекстовые сообщения', () => {
    setHistory([
      [
        historyMessage({ idMessage: 'h1' }),
        historyMessage({ idMessage: 'h2', typeMessage: 'imageMessage' }),
      ],
    ]);

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages.map((message) => message.id)).toEqual(['h1']);
  });

  it('сливает историю и живые сообщения по времени', () => {
    setHistory([[historyMessage({ idMessage: 'h1', timestamp: 100 })]]);
    addMessage({ id: 'live', chatId: 'c1', text: 'Живое', isOutgoing: false, timestamp: 200 });

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages.map((message) => message.id)).toEqual(['h1', 'live']);
  });

  it('схлопывает дубликат из истории и уведомления', () => {
    setHistory([[historyMessage({ idMessage: 'dup', text: 'Из истории' })]]);
    addMessage({ id: 'dup', chatId: 'c1', text: 'Живое', isOutgoing: false, timestamp: 100 });

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages).toHaveLength(1);
  });

  it('скрывает удалённые сообщения', () => {
    setHistory([[historyMessage({ idMessage: 'h1' })]]);
    useMessagesStore.getState().removeMessage('h1');

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages).toHaveLength(0);
  });

  it('скрывает удалённое живое сообщение', () => {
    addMessage({ id: 'live', chatId: 'c1', text: 'Живое', isOutgoing: false, timestamp: 1 });
    useMessagesStore.getState().removeMessage('live');

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages).toHaveLength(0);
  });

  it('подменяет текст отредактированного сообщения из истории', () => {
    setHistory([[historyMessage({ idMessage: 'h1', textMessage: 'Старый текст' })]]);
    useMessagesStore.getState().editMessage('h1', 'Новый текст');

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages[0].text).toBe('Новый текст');
  });

  it('подменяет текст отредактированного живого сообщения', () => {
    addMessage({ id: 'live', chatId: 'c1', text: 'Старое', isOutgoing: true, timestamp: 1 });
    useMessagesStore.getState().editMessage('live', 'Новое');

    const { result } = renderHook(() => useConversationMessages('c1'));

    expect(result.current.messages[0].text).toBe('Новое');
  });

  it('пробрасывает поля истории и действия подгрузки', () => {
    const fetchNextPage = vi.fn();
    const refetch = vi.fn();
    setHistory([[]], {
      isPending: true,
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage,
      refetch,
    });

    const { result } = renderHook(() => useConversationMessages('c1'));
    result.current.loadMore();
    result.current.retry();

    expect(result.current.isPending).toBe(true);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(true);
    expect(fetchNextPage).toHaveBeenCalledOnce();
    expect(refetch).toHaveBeenCalledOnce();
  });
});

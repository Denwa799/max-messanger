import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ChatMessage } from './types';
import {
  addMessage,
  resetMessages,
  useChatMessages,
  useDeletedMessageIds,
  useEditedTextById,
  useMessagesStore,
} from './store';

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm1',
  chatId: 'c1',
  text: 'Привет',
  isOutgoing: false,
  timestamp: 100,
  ...overrides,
});

const getMessages = (chatId: string) => useMessagesStore.getState().messagesByChat[chatId] ?? [];

beforeEach(() => {
  resetMessages();
});

describe('useMessagesStore.addMessage', () => {
  it('добавляет сообщение в свой чат', () => {
    addMessage(makeMessage());

    expect(getMessages('c1')).toHaveLength(1);
  });

  it('хранит сообщения разных чатов раздельно', () => {
    addMessage(makeMessage({ id: 'm1', chatId: 'c1' }));
    addMessage(makeMessage({ id: 'm2', chatId: 'c2' }));

    expect(getMessages('c1').map((m) => m.id)).toEqual(['m1']);
    expect(getMessages('c2').map((m) => m.id)).toEqual(['m2']);
  });

  it('сортирует сообщения по времени', () => {
    addMessage(makeMessage({ id: 'late', timestamp: 200 }));
    addMessage(makeMessage({ id: 'early', timestamp: 100 }));

    expect(getMessages('c1').map((m) => m.id)).toEqual(['early', 'late']);
  });

  it('игнорирует сообщение с уже существующим id (эхо уведомления)', () => {
    addMessage(makeMessage({ id: 'dup', text: 'первое' }));
    addMessage(makeMessage({ id: 'dup', text: 'второе' }));

    expect(getMessages('c1')).toHaveLength(1);
    expect(getMessages('c1')[0].text).toBe('первое');
  });

  it('позволяет одинаковые id в разных чатах', () => {
    addMessage(makeMessage({ id: 'same', chatId: 'c1' }));
    addMessage(makeMessage({ id: 'same', chatId: 'c2' }));

    expect(getMessages('c1')).toHaveLength(1);
    expect(getMessages('c2')).toHaveLength(1);
  });
});

describe('useMessagesStore.removeMessage', () => {
  it('помечает сообщение удалённым, не убирая его из messagesByChat', () => {
    addMessage(makeMessage({ id: 'm1' }));

    useMessagesStore.getState().removeMessage('m1');

    expect(useMessagesStore.getState().deletedMessageIds).toEqual({ m1: true });
    expect(getMessages('c1')).toHaveLength(1);
  });

  it('не меняет состояние при повторном удалении', () => {
    useMessagesStore.getState().removeMessage('m1');
    const before = useMessagesStore.getState().deletedMessageIds;

    useMessagesStore.getState().removeMessage('m1');

    expect(useMessagesStore.getState().deletedMessageIds).toBe(before);
  });
});

describe('useMessagesStore.editMessage', () => {
  it('сохраняет новый текст сообщения', () => {
    useMessagesStore.getState().editMessage('m1', 'Изменённый');

    expect(useMessagesStore.getState().editedTextById).toEqual({ m1: 'Изменённый' });
  });

  it('не меняет состояние, если текст тот же', () => {
    useMessagesStore.getState().editMessage('m1', 'Тот же');
    const before = useMessagesStore.getState().editedTextById;

    useMessagesStore.getState().editMessage('m1', 'Тот же');

    expect(useMessagesStore.getState().editedTextById).toBe(before);
  });
});

describe('useMessagesStore.reset', () => {
  it('очищает сообщения, удаления и правки', () => {
    addMessage(makeMessage());
    useMessagesStore.getState().removeMessage('m1');
    useMessagesStore.getState().editMessage('m1', 'текст');

    resetMessages();

    const state = useMessagesStore.getState();
    expect(state.messagesByChat).toEqual({});
    expect(state.deletedMessageIds).toEqual({});
    expect(state.editedTextById).toEqual({});
  });
});

describe('селекторы стора сообщений', () => {
  it('useChatMessages возвращает сообщения чата', () => {
    addMessage(makeMessage({ id: 'm1' }));

    const { result } = renderHook(() => useChatMessages('c1'));

    expect(result.current.map((m) => m.id)).toEqual(['m1']);
  });

  it('useChatMessages возвращает пустой список для неизвестного чата', () => {
    const { result } = renderHook(() => useChatMessages('unknown'));

    expect(result.current).toEqual([]);
  });

  it('useDeletedMessageIds отдаёт карту удалённых id', () => {
    useMessagesStore.getState().removeMessage('m1');

    const { result } = renderHook(() => useDeletedMessageIds());

    expect(result.current).toEqual({ m1: true });
  });

  it('useEditedTextById отдаёт карту правок', () => {
    useMessagesStore.getState().editMessage('m1', 'текст');

    const { result } = renderHook(() => useEditedTextById());

    expect(result.current).toEqual({ m1: 'текст' });
  });
});

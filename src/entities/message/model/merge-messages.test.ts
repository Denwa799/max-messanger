import { describe, expect, it } from 'vitest';

import { mergeMessages } from './merge-messages';
import type { ChatMessage } from './types';

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  chatId: 'chat-1',
  text: 'Привет',
  isOutgoing: false,
  timestamp: 100,
  ...overrides,
});

describe('mergeMessages', () => {
  it('возвращает пустой список для двух пустых источников', () => {
    expect(mergeMessages([], [])).toEqual([]);
  });

  it('сортирует сообщения по времени', () => {
    const result = mergeMessages(
      [makeMessage({ id: 'b', timestamp: 200 })],
      [makeMessage({ id: 'a', timestamp: 100 })],
    );

    expect(result.map((message) => message.id)).toEqual(['a', 'b']);
  });

  it('при равном времени сортирует по id, чтобы порядок был стабильным', () => {
    const result = mergeMessages(
      [],
      [makeMessage({ id: 'b', timestamp: 100 }), makeMessage({ id: 'a', timestamp: 100 })],
    );

    expect(result.map((message) => message.id)).toEqual(['a', 'b']);
  });

  it('схлопывает дубликаты по id, оставляя одно сообщение', () => {
    const result = mergeMessages([makeMessage({ id: 'dup' })], [makeMessage({ id: 'dup' })]);

    expect(result).toHaveLength(1);
  });

  it('берёт текст и время из свежего источника', () => {
    const result = mergeMessages(
      [makeMessage({ id: 'dup', text: 'Старый', timestamp: 100 })],
      [makeMessage({ id: 'dup', text: 'Новый', timestamp: 150 })],
    );

    expect(result[0]).toMatchObject({ text: 'Новый', timestamp: 150 });
  });

  it('сохраняет статус из истории, если у уведомления его нет', () => {
    const result = mergeMessages(
      [makeMessage({ id: 'dup', status: 'read' })],
      [makeMessage({ id: 'dup', status: undefined })],
    );

    expect(result[0].status).toBe('read');
  });

  it('сохраняет имя отправителя из истории, если у уведомления его нет', () => {
    const result = mergeMessages(
      [makeMessage({ id: 'dup', senderName: 'Иван' })],
      [makeMessage({ id: 'dup', senderName: undefined })],
    );

    expect(result[0].senderName).toBe('Иван');
  });

  it('перезаписывает статус и автора, если они пришли в свежем сообщении', () => {
    const result = mergeMessages(
      [makeMessage({ id: 'dup', status: 'sent', senderName: 'Старый' })],
      [makeMessage({ id: 'dup', status: 'read', senderName: 'Новый' })],
    );

    expect(result[0]).toMatchObject({ status: 'read', senderName: 'Новый' });
  });
});

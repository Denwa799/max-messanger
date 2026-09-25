import { describe, expect, it } from 'vitest';

import type { ChatHistoryMessage } from '@shared/api';

import { mapApiMessage } from './map-api-message';

const makeMessage = (overrides: Partial<ChatHistoryMessage> = {}): ChatHistoryMessage => ({
  type: 'incoming',
  idMessage: 'msg-1',
  timestamp: 1_700_000_000,
  typeMessage: 'textMessage',
  chatId: 'chat-1',
  textMessage: 'Привет',
  ...overrides,
});

describe('mapApiMessage', () => {
  it('приводит текстовое сообщение к доменной модели', () => {
    const result = mapApiMessage(makeMessage());

    expect(result).toEqual({
      id: 'msg-1',
      chatId: 'chat-1',
      text: 'Привет',
      isOutgoing: false,
      timestamp: 1_700_000_000,
      status: undefined,
      senderName: undefined,
    });
  });

  it('помечает исходящее сообщение', () => {
    expect(mapApiMessage(makeMessage({ type: 'outgoing' }))?.isOutgoing).toBe(true);
  });

  it.each(['sent', 'delivered', 'read'] as const)('пробрасывает статус %s', (statusMessage) => {
    expect(mapApiMessage(makeMessage({ statusMessage }))?.status).toBe(statusMessage);
  });

  it('отбрасывает неизвестный статус', () => {
    expect(mapApiMessage(makeMessage({ statusMessage: 'unknown' }))?.status).toBeUndefined();
  });

  it('пробрасывает имя отправителя', () => {
    expect(mapApiMessage(makeMessage({ senderName: 'Иван' }))?.senderName).toBe('Иван');
  });

  it.each(['textMessage', 'extendedTextMessage', 'quotedMessage'])(
    'показывает сообщение типа %s',
    (typeMessage) => {
      expect(mapApiMessage(makeMessage({ typeMessage }))).not.toBeNull();
    },
  );

  it.each(['imageMessage', 'locationMessage', 'contactMessage', 'pollMessage'])(
    'отбрасывает нетекстовое сообщение типа %s',
    (typeMessage) => {
      expect(mapApiMessage(makeMessage({ typeMessage }))).toBeNull();
    },
  );

  it('отбрасывает текстовое сообщение с пустым текстом', () => {
    expect(mapApiMessage(makeMessage({ textMessage: '' }))).toBeNull();
    expect(mapApiMessage(makeMessage({ textMessage: undefined }))).toBeNull();
  });
});

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMaxReceiveNotifications } from '@shared/api';
import type {
  IncomingNotification,
  MaxApiError,
  UseMaxReceiveNotificationsOptions,
} from '@shared/api';
import { logError } from '@shared/lib';

import { resetMessages, useMessagesStore } from './store';
import { useMessagesSync } from './use-messages-sync';

vi.mock('@shared/api', () => ({ useMaxReceiveNotifications: vi.fn() }));
vi.mock('@shared/lib', () => ({ logError: vi.fn() }));

let captured: UseMaxReceiveNotificationsOptions | undefined;

const notificationBody = (overrides: Partial<IncomingNotification> = {}): IncomingNotification => ({
  typeWebhook: 'incomingMessageReceived',
  idMessage: 'm1',
  timestamp: 100,
  senderData: { chatId: 'c1', senderName: 'Иван' },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
  ...overrides,
});

const emit = (overrides: Partial<IncomingNotification> = {}): void => {
  captured?.onNotification({ receiptId: 1, body: notificationBody(overrides) });
};

beforeEach(() => {
  captured = undefined;
  resetMessages();
  vi.mocked(useMaxReceiveNotifications).mockImplementation((options) => {
    captured = options;
  });
});

const setup = (): void => {
  renderHook(() => useMessagesSync());
};

describe('useMessagesSync', () => {
  it('складывает текст входящего сообщения в стор', () => {
    setup();

    act(() => emit());

    const messages = useMessagesStore.getState().messagesByChat.c1 ?? [];
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'm1',
      chatId: 'c1',
      text: 'Привет',
      isOutgoing: false,
      timestamp: 100,
      senderName: 'Иван',
    });
  });

  it('помечает исходящее сообщение по типу webhook', () => {
    setup();

    act(() => emit({ typeWebhook: 'outgoingMessageReceived' }));

    expect(useMessagesStore.getState().messagesByChat.c1[0].isOutgoing).toBe(true);
  });

  it('читает текст сообщения с цитатой из extendedTextMessageData', () => {
    setup();

    act(() =>
      emit({
        messageData: {
          typeMessage: 'quotedMessage',
          extendedTextMessageData: { text: 'Цитата' },
        },
      }),
    );

    expect(useMessagesStore.getState().messagesByChat.c1[0].text).toBe('Цитата');
  });

  it('подставляет текущее время, когда timestamp отсутствует', () => {
    setup();

    act(() => emit({ timestamp: undefined }));

    const now = Math.floor(Date.now() / 1000);
    expect(useMessagesStore.getState().messagesByChat.c1[0].timestamp).toBeGreaterThanOrEqual(
      now - 1,
    );
  });

  it('помечает удалённое сообщение по stanzaId', () => {
    setup();
    act(() => emit());

    act(() =>
      emit({
        messageData: { typeMessage: 'deletedMessage', deletedMessageData: { stanzaId: 'm1' } },
      }),
    );

    expect(useMessagesStore.getState().deletedMessageIds).toEqual({ m1: true });
    expect(useMessagesStore.getState().messagesByChat.c1).toHaveLength(1);
  });

  it('не удаляет сообщение без stanzaId', () => {
    setup();

    act(() =>
      emit({ messageData: { typeMessage: 'deletedMessage', deletedMessageData: undefined } }),
    );

    expect(useMessagesStore.getState().deletedMessageIds).toEqual({});
  });

  it('применяет правку сообщения по stanzaId', () => {
    setup();

    act(() =>
      emit({
        messageData: {
          typeMessage: 'editedMessage',
          editedMessageData: { stanzaId: 'm1', textMessage: 'Новый текст' },
        },
      }),
    );

    expect(useMessagesStore.getState().editedTextById).toEqual({ m1: 'Новый текст' });
  });

  it('не применяет правку без stanzaId или текста', () => {
    setup();

    act(() =>
      emit({ messageData: { typeMessage: 'editedMessage', editedMessageData: undefined } }),
    );

    expect(useMessagesStore.getState().editedTextById).toEqual({});
  });

  it('игнорирует webhook не про сообщение', () => {
    setup();

    act(() => emit({ typeWebhook: 'stateInstanceChanged' }));

    expect(useMessagesStore.getState().messagesByChat.c1).toBeUndefined();
  });

  it('игнорирует нетекстовое сообщение', () => {
    setup();

    act(() => emit({ messageData: { typeMessage: 'imageMessage' } }));

    expect(useMessagesStore.getState().messagesByChat.c1).toBeUndefined();
  });

  it('игнорирует сообщение без отправителя', () => {
    setup();

    act(() => emit({ senderData: undefined }));

    expect(useMessagesStore.getState().messagesByChat.c1).toBeUndefined();
  });

  it('логирует ошибку получения уведомления', () => {
    setup();
    const error = new Error('boom') as unknown as MaxApiError;

    act(() => captured?.onError?.(error));

    expect(logError).toHaveBeenCalledWith(error, 'Не удалось получить уведомление MAX');
  });
});

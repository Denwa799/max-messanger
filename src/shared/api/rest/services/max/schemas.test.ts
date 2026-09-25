import { describe, expect, it } from 'vitest';

import {
  chatMessageSchema,
  chatSchema,
  checkAccountResponseSchema,
  contactSchema,
  deleteNotificationResponseSchema,
  getChatHistoryResponseSchema,
  getChatsResponseSchema,
  getContactsResponseSchema,
  incomingNotificationSchema,
  receiveNotificationResponseSchema,
  sendMessageResponseSchema,
} from './schemas';

describe('chatSchema', () => {
  it('разбирает чат', () => {
    expect(
      chatSchema.parse({ chatId: 'c1', name: 'Иван', type: 'user', phoneNumber: 79991234567 }),
    ).toEqual({ chatId: 'c1', name: 'Иван', type: 'user', phoneNumber: 79991234567 });
  });

  it('отбрасывает лишние поля', () => {
    const result = chatSchema.parse({
      chatId: 'c1',
      name: 'Иван',
      type: 'user',
      phoneNumber: 0,
      unknownField: 'x',
    });

    expect(result).not.toHaveProperty('unknownField');
  });

  it('отклоняет неизвестный тип чата', () => {
    expect(
      chatSchema.safeParse({ chatId: 'c1', name: 'x', type: 'room', phoneNumber: 0 }).success,
    ).toBe(false);
  });

  it('отклоняет чат без обязательных полей', () => {
    expect(chatSchema.safeParse({ chatId: 'c1' }).success).toBe(false);
  });
});

describe('getChatsResponseSchema', () => {
  it('разбирает массив чатов', () => {
    const result = getChatsResponseSchema.parse([
      { chatId: 'c1', name: 'A', type: 'user', phoneNumber: 0 },
      { chatId: 'c2', name: 'B', type: 'group', phoneNumber: 0 },
    ]);

    expect(result).toHaveLength(2);
  });

  it('принимает пустой массив', () => {
    expect(getChatsResponseSchema.parse([])).toEqual([]);
  });

  it('отклоняет не-массив', () => {
    expect(getChatsResponseSchema.safeParse({}).success).toBe(false);
  });
});

describe('checkAccountResponseSchema', () => {
  it('разбирает существующий аккаунт с chatId', () => {
    expect(checkAccountResponseSchema.parse({ exist: true, chatId: 'c1' })).toEqual({
      exist: true,
      chatId: 'c1',
    });
  });

  it('разбирает отсутствующий аккаунт без chatId', () => {
    expect(checkAccountResponseSchema.parse({ exist: false })).toEqual({ exist: false });
  });

  it('отклоняет небулево exist', () => {
    expect(checkAccountResponseSchema.safeParse({ exist: 'yes' }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('разбирает контакт', () => {
    const contact = {
      chatId: 'c1',
      name: '',
      contactName: 'Иван',
      type: 'user',
      phoneNumber: 79991234567,
    };

    expect(contactSchema.parse(contact)).toEqual(contact);
  });
});

describe('getContactsResponseSchema', () => {
  it('отклоняет контакт без contactName', () => {
    expect(
      getContactsResponseSchema.safeParse([
        { chatId: 'c1', name: 'A', type: 'user', phoneNumber: 0 },
      ]).success,
    ).toBe(false);
  });
});

describe('chatMessageSchema', () => {
  const base = {
    type: 'incoming',
    idMessage: 'm1',
    timestamp: 100,
    typeMessage: 'textMessage',
    chatId: 'c1',
    textMessage: 'Привет',
  };

  it('разбирает минимальное сообщение истории', () => {
    expect(chatMessageSchema.parse(base)).toMatchObject(base);
  });

  it('сохраняет неизвестные поля (медиа, реакции и т.п.)', () => {
    const result = chatMessageSchema.parse({ ...base, imageMessage: { caption: 'x' } });

    expect(result).toHaveProperty('imageMessage');
  });

  it('отклоняет неверное направление сообщения', () => {
    expect(chatMessageSchema.safeParse({ ...base, type: 'self' }).success).toBe(false);
  });

  it('требует timestamp числом', () => {
    expect(chatMessageSchema.safeParse({ ...base, timestamp: '100' }).success).toBe(false);
  });

  it('разбирает историю как массив', () => {
    expect(getChatHistoryResponseSchema.parse([base])).toHaveLength(1);
  });
});

describe('incomingNotificationSchema', () => {
  it('принимает уведомление с одним typeWebhook и неизвестные поля', () => {
    const result = incomingNotificationSchema.parse({
      typeWebhook: 'incomingMessageReceived',
      someNewField: 'x',
    });

    expect(result.typeWebhook).toBe('incomingMessageReceived');
    expect(result).toHaveProperty('someNewField');
  });

  it('требует typeWebhook', () => {
    expect(incomingNotificationSchema.safeParse({}).success).toBe(false);
  });

  it('разбирает данные сообщения с текстом', () => {
    const result = incomingNotificationSchema.parse({
      typeWebhook: 'incomingMessageReceived',
      idMessage: 'm1',
      timestamp: 100,
      senderData: { chatId: 'c1', senderName: 'Иван' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    });

    expect(result.messageData?.textMessageData?.textMessage).toBe('Привет');
  });

  it('разбирает уведомление об удалении по stanzaId', () => {
    const result = incomingNotificationSchema.parse({
      typeWebhook: 'incomingMessageReceived',
      messageData: { typeMessage: 'deletedMessage', deletedMessageData: { stanzaId: 'm1' } },
    });

    expect(result.messageData?.deletedMessageData?.stanzaId).toBe('m1');
  });

  it('разбирает уведомление о редактировании', () => {
    const result = incomingNotificationSchema.parse({
      typeWebhook: 'incomingMessageReceived',
      messageData: {
        typeMessage: 'editedMessage',
        editedMessageData: { stanzaId: 'm1', textMessage: 'Новый текст' },
      },
    });

    expect(result.messageData?.editedMessageData).toEqual({
      stanzaId: 'm1',
      textMessage: 'Новый текст',
    });
  });
});

describe('sendMessageResponseSchema', () => {
  it('разбирает idMessage', () => {
    expect(sendMessageResponseSchema.parse({ idMessage: 'm1' })).toEqual({ idMessage: 'm1' });
  });

  it('отклоняет ответ без idMessage', () => {
    expect(sendMessageResponseSchema.safeParse({}).success).toBe(false);
  });
});

describe('receiveNotificationResponseSchema', () => {
  it('разбирает уведомление с receiptId и телом', () => {
    const result = receiveNotificationResponseSchema.parse({
      receiptId: 5,
      body: { typeWebhook: 'incomingMessageReceived' },
    });

    expect(result.receiptId).toBe(5);
    expect(result.body.typeWebhook).toBe('incomingMessageReceived');
  });

  it('отклоняет ответ без receiptId', () => {
    expect(
      receiveNotificationResponseSchema.safeParse({ body: { typeWebhook: 'x' } }).success,
    ).toBe(false);
  });
});

describe('deleteNotificationResponseSchema', () => {
  it('разбирает успешный результат', () => {
    expect(deleteNotificationResponseSchema.parse({ result: true })).toEqual({ result: true });
  });

  it('разбирает результат с причиной', () => {
    expect(deleteNotificationResponseSchema.parse({ result: false, reason: 'not found' })).toEqual({
      result: false,
      reason: 'not found',
    });
  });
});

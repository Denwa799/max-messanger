import type { AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MaxApiError, maxApiAxios } from '../../client';

import { MaxService } from '.';

const credentials = { idInstance: '1', apiTokenInstance: 'token' };

const ok = (data: unknown) => ({ data }) as unknown as AxiosResponse;

const resolveGet = (data: unknown) => vi.spyOn(maxApiAxios, 'get').mockResolvedValue(ok(data));
const resolvePost = (data: unknown) => vi.spyOn(maxApiAxios, 'post').mockResolvedValue(ok(data));
const resolveDelete = (data: unknown) =>
  vi.spyOn(maxApiAxios, 'delete').mockResolvedValue(ok(data));

beforeEach(() => {
  // Ошибки сервис логирует — не засоряем вывод тестов.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('MaxService.getChats', () => {
  it('запрашивает чаты по idInstance и токену', async () => {
    const spy = resolveGet([{ chatId: 'c1', name: 'A', type: 'user', phoneNumber: 0 }]);

    const result = await MaxService.getChats(credentials);

    expect(spy).toHaveBeenCalledWith('/waInstance1/getChats/token');
    expect(result).toHaveLength(1);
  });

  it('подбирает понятное сообщение для известной ошибки', async () => {
    vi.spyOn(maxApiAxios, 'get').mockRejectedValue(
      new MaxApiError('bad', { status: 400, description: 'apiTokenInstance not define' }),
    );

    await expect(MaxService.getChats(credentials)).rejects.toMatchObject({
      status: 400,
      userMessage: 'Не задан apiTokenInstance',
    });
  });

  it('помечает несоответствие схеме как протокольную ошибку', async () => {
    resolveGet({ not: 'array' });

    await expect(MaxService.getChats(credentials)).rejects.toMatchObject({
      isProtocolError: true,
      userMessage: 'Не удалось выполнить запрос',
    });
  });
});

describe('MaxService.getContacts', () => {
  it('передаёт limit, когда count задан', async () => {
    const spy = resolveGet([]);

    await MaxService.getContacts({ ...credentials, count: 10 });

    expect(spy).toHaveBeenCalledWith('/waInstance1/getContacts/token', { params: { count: 10 } });
  });

  it('не передаёт params, когда count не задан', async () => {
    const spy = resolveGet([]);

    await MaxService.getContacts(credentials);

    expect(spy).toHaveBeenCalledWith('/waInstance1/getContacts/token', { params: undefined });
  });
});

describe('MaxService.checkAccount', () => {
  it('отправляет номер телефона', async () => {
    const spy = resolvePost({ exist: true, chatId: 'c1' });

    const result = await MaxService.checkAccount({ ...credentials, phoneNumber: 79991234567 });

    expect(spy).toHaveBeenCalledWith('/waInstance1/checkAccount/token', {
      phoneNumber: 79991234567,
    });
    expect(result).toEqual({ exist: true, chatId: 'c1' });
  });
});

describe('MaxService.sendMessage', () => {
  it('отправляет тело сообщения и возвращает idMessage', async () => {
    const spy = resolvePost({ idMessage: 'm1' });

    const result = await MaxService.sendMessage({
      ...credentials,
      chatId: 'c1',
      message: 'Привет',
      typingTime: 1000,
      quotedMessageId: 'm0',
    });

    expect(spy).toHaveBeenCalledWith('/waInstance1/sendMessage/token', {
      chatId: 'c1',
      message: 'Привет',
      typingTime: 1000,
      quotedMessageId: 'm0',
    });
    expect(result).toEqual({ idMessage: 'm1' });
  });
});

describe('MaxService.getChatHistory', () => {
  it('передаёт chatId и count', async () => {
    const spy = resolvePost([]);

    await MaxService.getChatHistory({ ...credentials, chatId: 'c1', count: 100 });

    expect(spy).toHaveBeenCalledWith('/waInstance1/getChatHistory/token', {
      chatId: 'c1',
      count: 100,
    });
  });

  it('не передаёт count, если он не задан', async () => {
    const spy = resolvePost([]);

    await MaxService.getChatHistory({ ...credentials, chatId: 'c1' });

    expect(spy).toHaveBeenCalledWith('/waInstance1/getChatHistory/token', { chatId: 'c1' });
  });

  it('распознаёт ошибку по идентификатору чата', async () => {
    vi.spyOn(maxApiAxios, 'post').mockRejectedValue(
      new MaxApiError('bad', { status: 400, description: 'chatId invalid' }),
    );

    await expect(MaxService.getChatHistory({ ...credentials, chatId: 'c1' })).rejects.toMatchObject(
      { userMessage: 'Некорректный идентификатор чата' },
    );
  });
});

describe('MaxService.receiveNotification', () => {
  it('возвращает null при пустом ответе (таймаут ожидания)', async () => {
    resolveGet('');

    await expect(MaxService.receiveNotification(credentials)).resolves.toBeNull();
  });

  it('разбирает уведомление', async () => {
    resolveGet({ receiptId: 1, body: { typeWebhook: 'incomingMessageReceived' } });

    const result = await MaxService.receiveNotification({ ...credentials, receiveTimeout: 10 });

    expect(result?.receiptId).toBe(1);
  });

  it('берёт клиентский таймаут с запасом к receiveTimeout', async () => {
    const spy = resolveGet(null);

    await MaxService.receiveNotification({ ...credentials, receiveTimeout: 10 });

    expect(spy).toHaveBeenCalledWith('/waInstance1/receiveNotification/token', {
      params: { receiveTimeout: 10 },
      timeout: 15_000,
    });
  });

  it('по умолчанию ждёт 5 секунд', async () => {
    const spy = resolveGet(null);

    await MaxService.receiveNotification(credentials);

    expect(spy).toHaveBeenCalledWith('/waInstance1/receiveNotification/token', {
      params: { receiveTimeout: 5 },
      timeout: 10_000,
    });
  });
});

describe('MaxService.deleteNotification', () => {
  it('подтверждает уведомление по receiptId', async () => {
    const spy = resolveDelete({ result: true });

    const result = await MaxService.deleteNotification({ ...credentials, receiptId: 42 });

    expect(spy).toHaveBeenCalledWith('/waInstance1/deleteNotification/token/42');
    expect(result).toEqual({ result: true });
  });

  it('распознаёт некорректный receiptId', async () => {
    vi.spyOn(maxApiAxios, 'delete').mockRejectedValue(
      new MaxApiError('bad', { status: 400, description: 'receiptId must be a Number' }),
    );

    await expect(
      MaxService.deleteNotification({ ...credentials, receiptId: 1 }),
    ).rejects.toMatchObject({ userMessage: 'Некорректный receiptId' });
  });
});

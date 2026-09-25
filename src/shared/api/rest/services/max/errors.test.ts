import { describe, expect, it } from 'vitest';

import { MaxApiError } from '../../client';
import type { MaxErrorRule } from './errors';
import {
  CHECK_ACCOUNT_ERROR_RULES,
  GET_CHATS_ERROR_RULES,
  RECEIVE_NOTIFICATION_ERROR_RULES,
  SEND_MESSAGE_ERROR_RULES,
  resolveErrorMessage,
} from './errors';

const makeError = (options: { status?: number; description?: string; message?: string } = {}) =>
  new MaxApiError(options.message ?? 'Ошибка', {
    status: options.status,
    description: options.description,
  });

describe('resolveErrorMessage', () => {
  it('подбирает сообщение по статусу и тексту ошибки', () => {
    const rules: MaxErrorRule[] = [
      { status: 400, match: (text) => text.includes('token'), message: 'Нет токена' },
    ];

    expect(resolveErrorMessage(rules, makeError({ status: 400, description: 'bad token' }))).toBe(
      'Нет токена',
    );
  });

  it('матчит правило без предиката по одному статусу', () => {
    const rules: MaxErrorRule[] = [{ status: 400, message: 'Ошибка валидации' }];

    expect(resolveErrorMessage(rules, makeError({ status: 400 }))).toBe('Ошибка валидации');
  });

  it('ищет текст и в описании, и в сообщении', () => {
    const rules: MaxErrorRule[] = [
      { status: 400, match: (text) => text.includes('webhook'), message: 'Есть webhook' },
    ];

    expect(resolveErrorMessage(rules, makeError({ status: 400, message: 'webhookUrl set' }))).toBe(
      'Есть webhook',
    );
  });

  it('возвращает «не удалось выполнить», когда статуса нет', () => {
    expect(resolveErrorMessage([], makeError())).toBe('Не удалось выполнить запрос');
  });

  it('возвращает ошибку сервера для 5xx', () => {
    expect(resolveErrorMessage([], makeError({ status: 503 }))).toBe('Ошибка на стороне сервера');
  });

  it('возвращает ошибку клиента для 4xx', () => {
    expect(resolveErrorMessage([], makeError({ status: 404 }))).toBe('Ошибка запроса');
  });

  it.each([301, 204])('возвращает «не удалось выполнить» для статуса %i', (status) => {
    expect(resolveErrorMessage([], makeError({ status }))).toBe('Не удалось выполнить запрос');
  });
});

describe('правила сообщений MAX API', () => {
  it('распознаёт заданный webhookUrl', () => {
    const error = makeError({ status: 400, description: 'webhookUrl is set for instance' });

    expect(resolveErrorMessage(RECEIVE_NOTIFICATION_ERROR_RULES, error)).toContain('webhookUrl');
  });

  it('распознаёт незаданный apiTokenInstance', () => {
    const error = makeError({ status: 400, description: 'apiTokenInstance not define' });

    expect(resolveErrorMessage(GET_CHATS_ERROR_RULES, error)).toBe('Не задан apiTokenInstance');
  });

  it('распознаёт нечисловой idInstance', () => {
    const error = makeError({ status: 400, description: 'idInstance not an integer' });

    expect(resolveErrorMessage(GET_CHATS_ERROR_RULES, error)).toBe(
      'Параметр idInstance задан неверно',
    );
  });

  it('возвращает общую ошибку валидации для прочих 400', () => {
    expect(resolveErrorMessage(GET_CHATS_ERROR_RULES, makeError({ status: 400 }))).toBe(
      'Ошибка валидации запроса',
    );
  });

  it('распознаёт превышение лимита запросов', () => {
    expect(resolveErrorMessage(GET_CHATS_ERROR_RULES, makeError({ status: 429 }))).toContain(
      'лимит запросов',
    );
  });

  it('распознаёт некорректный номер телефона', () => {
    const error = makeError({ status: 400, description: 'phoneNumber should be valid' });

    expect(resolveErrorMessage(CHECK_ACCOUNT_ERROR_RULES, error)).toBe(
      'Некорректный номер телефона',
    );
  });

  it('распознаёт превышение длины текста сообщения', () => {
    const error = makeError({ status: 400, description: 'message cannot exceed 4000 chars' });

    expect(resolveErrorMessage(SEND_MESSAGE_ERROR_RULES, error)).toContain('4000');
  });

  it('распознаёт ограничения на отправку', () => {
    expect(resolveErrorMessage(SEND_MESSAGE_ERROR_RULES, makeError({ status: 403 }))).toContain(
      'ограничения',
    );
  });
});

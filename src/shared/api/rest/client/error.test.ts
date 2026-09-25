import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { MaxApiError } from './error';

const makeAxiosError = ({
  data,
  status,
  message = 'Request failed',
}: {
  data?: unknown;
  status?: number;
  message?: string;
} = {}): AxiosError => {
  const response =
    status === undefined && data === undefined
      ? undefined
      : ({ data, status } as unknown as AxiosResponse);

  return new AxiosError(message, 'ERR_BAD_REQUEST', undefined, undefined, response);
};

const makeZodError = (): z.ZodError => {
  const result = z.object({ value: z.string() }).safeParse({});

  if (result.success) throw new Error('Ожидалась ошибка разбора схемы');
  return result.error;
};

describe('MaxApiError', () => {
  it('сохраняет переданные поля и имя', () => {
    const cause = new Error('cause');
    const error = new MaxApiError('Сообщение', {
      status: 400,
      code: 'ERR',
      description: 'описание',
      userMessage: 'Понятный текст',
      isProtocolError: true,
      cause,
    });

    expect(error).toMatchObject({
      name: 'MaxApiError',
      message: 'Сообщение',
      status: 400,
      code: 'ERR',
      description: 'описание',
      userMessage: 'Понятный текст',
      isProtocolError: true,
      cause,
    });
  });

  describe('withUserMessage', () => {
    it('возвращает тот же объект, если сообщение не изменилось', () => {
      const error = new MaxApiError('msg', { userMessage: 'Одинаково' });

      expect(error.withUserMessage('Одинаково')).toBe(error);
    });

    it('создаёт новую ошибку с тем же контекстом и ссылкой на исходную', () => {
      const error = new MaxApiError('msg', { status: 500, code: 1, isProtocolError: true });

      const result = error.withUserMessage('Другое');

      expect(result).not.toBe(error);
      expect(result).toMatchObject({
        message: 'msg',
        status: 500,
        code: 1,
        userMessage: 'Другое',
        isProtocolError: true,
      });
      expect(result.cause).toBe(error);
    });
  });

  describe('from', () => {
    it('возвращает исходную MaxApiError без обёртки', () => {
      const error = new MaxApiError('уже MaxApiError');

      expect(MaxApiError.from(error)).toBe(error);
    });

    it('помечает ошибку схемы как протокольную', () => {
      const result = MaxApiError.from(makeZodError());

      expect(result.isProtocolError).toBe(true);
      expect(result.message).toBe('Ответ MAX API не соответствует схеме');
      expect(result.description).toBeTypeOf('string');
    });

    it('разбирает структурированную ошибку Axios', () => {
      const result = MaxApiError.from(
        makeAxiosError({
          status: 400,
          data: { code: 400, message: 'Некорректный запрос', description: 'Детали' },
        }),
      );

      expect(result).toMatchObject({
        message: 'Некорректный запрос',
        status: 400,
        code: 400,
        description: 'Детали',
      });
    });

    it('превращает строковое тело ошибки в описание', () => {
      const result = MaxApiError.from(makeAxiosError({ status: 500, data: 'internal error' }));

      expect(result.description).toBe('internal error');
      expect(result.message).toBe('Request failed');
    });

    it('сериализует произвольный JSON в описание', () => {
      const result = MaxApiError.from(makeAxiosError({ status: 400, data: { reason: 'x' } }));

      expect(result.description).toBe('{"reason":"x"}');
    });

    it('не падает на циклическом теле ответа', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = MaxApiError.from(makeAxiosError({ status: 400, data: circular }));

      expect(result.description).toBeUndefined();
    });

    it('обрабатывает ошибку Axios без ответа', () => {
      const result = MaxApiError.from(makeAxiosError({ message: 'Network Error' }));

      expect(result.message).toBe('Network Error');
      expect(result.status).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it('игнорирует null вместо тела ответа', () => {
      const result = MaxApiError.from(makeAxiosError({ status: 500, data: null }));

      expect(result.description).toBeUndefined();
    });

    it('оборачивает обычную ошибку', () => {
      const cause = new Error('boom');
      const result = MaxApiError.from(cause);

      expect(result.message).toBe('boom');
      expect(result.cause).toBe(cause);
    });

    it('обрабатывает не-Error значение', () => {
      expect(MaxApiError.from('строковая ошибка').message).toBe('Unknown error');
    });
  });
});

import { AxiosError } from 'axios';
import { z } from 'zod';

const maxApiErrorDataSchema = z.object({
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Green-API не всегда возвращает ошибку объектом: иногда это строка или произвольный JSON.
 * Приводим тело к тексту, чтобы не терять реальную причину отказа.
 */
const toErrorText = (raw: unknown): string | undefined => {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw === 'string') return raw;

  try {
    return JSON.stringify(raw);
  } catch {
    return undefined;
  }
};

export interface MaxApiErrorOptions {
  status?: number;
  code?: number | string;
  description?: string;
  userMessage?: string;
  /**
   * Ошибка формата ответа: он не прошёл разбор схемой. Это не сетевой сбой, поэтому повторять
   * запрос бессмысленно — тот же ответ снова не разберётся.
   */
  isProtocolError?: boolean;
  cause?: unknown;
}

export class MaxApiError extends Error {
  readonly status?: number;
  readonly code?: number | string;
  readonly description?: string;
  readonly userMessage?: string;
  readonly isProtocolError?: boolean;

  constructor(message: string, options: MaxApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'MaxApiError';
    this.status = options.status;
    this.code = options.code;
    this.description = options.description;
    this.userMessage = options.userMessage;
    this.isProtocolError = options.isProtocolError;
  }

  withUserMessage(userMessage: string): MaxApiError {
    if (this.userMessage === userMessage) return this;

    return new MaxApiError(this.message, {
      status: this.status,
      code: this.code,
      description: this.description,
      userMessage,
      isProtocolError: this.isProtocolError,
      cause: this,
    });
  }

  static from(error: unknown): MaxApiError {
    if (error instanceof MaxApiError) return error;

    // Ответ пришёл, но не соответствует схеме — помечаем как протокольную ошибку, чтобы
    // вызывающий код (например, long-polling уведомлений) не повторял запрос бесконечно.
    if (error instanceof z.ZodError) {
      return new MaxApiError('Ответ MAX API не соответствует схеме', {
        description: error.message,
        isProtocolError: true,
        cause: error,
      });
    }

    if (error instanceof AxiosError) {
      const raw = error.response?.data;
      const parsed = maxApiErrorDataSchema.safeParse(raw);
      const data = parsed.success ? parsed.data : undefined;

      return new MaxApiError(data?.message ?? error.message, {
        status: error.response?.status,
        code: data?.code,
        description: data?.description ?? toErrorText(raw),
        cause: error,
      });
    }

    return new MaxApiError(error instanceof Error ? error.message : 'Unknown error', {
      cause: error,
    });
  }
}

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
  cause?: unknown;
}

export class MaxApiError extends Error {
  readonly status?: number;
  readonly code?: number | string;
  readonly description?: string;
  readonly userMessage?: string;

  constructor(message: string, options: MaxApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'MaxApiError';
    this.status = options.status;
    this.code = options.code;
    this.description = options.description;
    this.userMessage = options.userMessage;
  }

  withUserMessage(userMessage: string): MaxApiError {
    if (this.userMessage === userMessage) return this;

    return new MaxApiError(this.message, {
      status: this.status,
      code: this.code,
      description: this.description,
      userMessage,
      cause: this,
    });
  }

  static from(error: unknown): MaxApiError {
    if (error instanceof MaxApiError) return error;

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

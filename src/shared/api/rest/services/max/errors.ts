import { MaxApiError } from '../../client';

export interface MaxErrorRule {
  status: number;
  /** Уточнение для случаев, когда у метода несколько ошибок с одним HTTP-кодом. */
  match?: (error: MaxApiError) => boolean;
  message: string;
}

const FALLBACK_MESSAGES = {
  client: 'Ошибка запроса',
  server: 'Ошибка на стороне сервера',
  unknown: 'Не удалось выполнить запрос',
} as const;

/** Подбирает текст для UI по правилам конкретного метода. */
export const resolveErrorMessage = (rules: MaxErrorRule[], error: MaxApiError): string => {
  const rule = rules.find(
    ({ status, match }) => status === error.status && (!match || match(error)),
  );
  if (rule) return rule.message;

  if (error.status === undefined) return FALLBACK_MESSAGES.unknown;
  if (error.status >= 500) return FALLBACK_MESSAGES.server;
  if (error.status >= 400) return FALLBACK_MESSAGES.client;

  return FALLBACK_MESSAGES.unknown;
};

/** Ошибки метода sendMessage (раздел «Ошибки SendMessage» MAX API). */
export const SEND_MESSAGE_ERROR_RULES: MaxErrorRule[] = [
  {
    status: 400,
    match: (error) => /4000/.test(`${error.description ?? ''} ${error.message}`),
    message: 'Текст сообщения должен быть не длиннее 4000 символов',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
  { status: 403, message: 'На аккаунте временные ограничения: отправка сообщений недоступна' },
  { status: 500, message: 'Превышен допустимый размер запроса' },
];

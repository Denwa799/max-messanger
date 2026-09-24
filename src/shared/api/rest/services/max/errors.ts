import { MaxApiError } from '../../client';

export interface MaxErrorRule {
  status: number;
  match?: (error: MaxApiError) => boolean;
  message: string;
}

const FALLBACK_MESSAGES = {
  client: 'Ошибка запроса',
  server: 'Ошибка на стороне сервера',
  unknown: 'Не удалось выполнить запрос',
} as const;

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

const searchableText = (error: MaxApiError): string =>
  `${error.description ?? ''} ${error.message}`;

const isWebhookUrlSet = (error: MaxApiError): boolean => /webhook/i.test(searchableText(error));

const WEBHOOK_URL_SET_MESSAGE =
  'Получение уведомлений недоступно: для инстанса задан webhookUrl. Очистите его в кабинете и повторите примерно через минуту';

export const RECEIVE_NOTIFICATION_ERROR_RULES: MaxErrorRule[] = [
  { status: 400, match: isWebhookUrlSet, message: WEBHOOK_URL_SET_MESSAGE },
  {
    status: 400,
    match: (error) => /apiTokenInstance not define/i.test(searchableText(error)),
    message: 'Не задан apiTokenInstance',
  },
  {
    status: 400,
    match: (error) => /idInstance not an integer/i.test(searchableText(error)),
    message: 'Параметр idInstance задан неверно',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
];

export const DELETE_NOTIFICATION_ERROR_RULES: MaxErrorRule[] = [
  {
    status: 400,
    match: (error) => /receiptId must be a Number/i.test(searchableText(error)),
    message: 'Некорректный receiptId',
  },
  { status: 400, match: isWebhookUrlSet, message: WEBHOOK_URL_SET_MESSAGE },
  {
    status: 400,
    match: (error) => /apiTokenInstance not define/i.test(searchableText(error)),
    message: 'Не задан apiTokenInstance',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
  {
    status: 500,
    match: (error) => /findUnAckedMessage/i.test(searchableText(error)),
    message: 'Уведомление не найдено: возможно, оно уже было удалено',
  },
];

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

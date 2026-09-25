import type { MaxApiError } from '../../client';

export interface MaxErrorRule {
  status: number;
  /** Предикат по тексту ошибки (описание + сообщение). Если не задан — правило матчит любой статус. */
  match?: (searchText: string) => boolean;
  message: string;
}

const FALLBACK_MESSAGES = {
  client: 'Ошибка запроса',
  server: 'Ошибка на стороне сервера',
  unknown: 'Не удалось выполнить запрос',
} as const;

export const resolveErrorMessage = (rules: MaxErrorRule[], error: MaxApiError): string => {
  const text = toSearchText(error);
  const rule = rules.find(
    ({ status, match }) => status === error.status && (!match || match(text)),
  );
  if (rule) return rule.message;

  if (error.status === undefined) return FALLBACK_MESSAGES.unknown;
  if (error.status >= 500) return FALLBACK_MESSAGES.server;
  if (error.status >= 400) return FALLBACK_MESSAGES.client;

  return FALLBACK_MESSAGES.unknown;
};

const toSearchText = (error: MaxApiError): string => `${error.description ?? ''} ${error.message}`;

const isWebhookUrlSet = (searchText: string): boolean => /webhook/i.test(searchText);

const WEBHOOK_URL_SET_MESSAGE =
  'Получение уведомлений недоступно: для инстанса задан webhookUrl. Очистите его в кабинете и повторите примерно через минуту';

export const RECEIVE_NOTIFICATION_ERROR_RULES: MaxErrorRule[] = [
  { status: 400, match: isWebhookUrlSet, message: WEBHOOK_URL_SET_MESSAGE },
  {
    status: 400,
    match: (text) => /apiTokenInstance not define/i.test(text),
    message: 'Не задан apiTokenInstance',
  },
  {
    status: 400,
    match: (text) => /idInstance not an integer/i.test(text),
    message: 'Параметр idInstance задан неверно',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
];

export const DELETE_NOTIFICATION_ERROR_RULES: MaxErrorRule[] = [
  {
    status: 400,
    match: (text) => /receiptId must be a Number/i.test(text),
    message: 'Некорректный receiptId',
  },
  { status: 400, match: isWebhookUrlSet, message: WEBHOOK_URL_SET_MESSAGE },
  {
    status: 400,
    match: (text) => /apiTokenInstance not define/i.test(text),
    message: 'Не задан apiTokenInstance',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
  {
    status: 500,
    match: (text) => /findUnAckedMessage/i.test(text),
    message: 'Уведомление не найдено: возможно, оно уже было удалено',
  },
];

export const SEND_MESSAGE_ERROR_RULES: MaxErrorRule[] = [
  {
    status: 400,
    match: (text) => /4000/.test(text),
    message: 'Текст сообщения должен быть не длиннее 4000 символов',
  },
  { status: 400, message: 'Ошибка валидации запроса' },
  { status: 403, message: 'На аккаунте временные ограничения: отправка сообщений недоступна' },
  { status: 500, message: 'Превышен допустимый размер запроса' },
];

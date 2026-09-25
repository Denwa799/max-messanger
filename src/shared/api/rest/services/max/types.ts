import type { z } from 'zod';
import type {
  chatSchema,
  checkAccountResponseSchema,
  contactSchema,
  deleteNotificationResponseSchema,
  getChatsResponseSchema,
  getContactsResponseSchema,
  incomingNotificationSchema,
  receiveNotificationResponseSchema,
  sendMessageResponseSchema,
} from './schemas';

export interface SendMessageRequest {
  idInstance: string;
  apiTokenInstance: string;
  message: string;
  chatId: string;
  /** Время показа уведомления о наборе сообщения, от 1000 до 20000 мс. */
  typingTime?: number;
  /** Идентификатор цитируемого сообщения из того же чата. */
  quotedMessageId?: string;
}

/** Параметры отправки без учётных данных: они подставляются из стора. */
export type SendMessageVariables = Omit<SendMessageRequest, 'idInstance' | 'apiTokenInstance'>;

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

export interface GetChatsRequest {
  idInstance: string;
  apiTokenInstance: string;
}

export type Chat = z.infer<typeof chatSchema>;
export type ChatType = Chat['type'];
export type GetChatsResponse = z.infer<typeof getChatsResponseSchema>;

export interface CheckAccountRequest {
  idInstance: string;
  apiTokenInstance: string;
  /** Номер телефона без знака `+`, например 79991234567. */
  phoneNumber: number;
}

/** Параметры проверки аккаунта без учётных данных: они подставляются из стора. */
export type CheckAccountVariables = Omit<CheckAccountRequest, 'idInstance' | 'apiTokenInstance'>;

export type CheckAccountResponse = z.infer<typeof checkAccountResponseSchema>;

export interface GetContactsRequest {
  idInstance: string;
  apiTokenInstance: string;
  /** Ограничение количества контактов. Без него отдаются все контакты. */
  count?: number;
}

export type Contact = z.infer<typeof contactSchema>;
export type GetContactsResponse = z.infer<typeof getContactsResponseSchema>;

export interface ReceiveNotificationRequest {
  idInstance: string;
  apiTokenInstance: string;
  /** Таймаут ожидания уведомления в секундах, от 5 до 60. По умолчанию 5. */
  receiveTimeout?: number;
}

export interface DeleteNotificationRequest {
  idInstance: string;
  apiTokenInstance: string;
  /** Идентификатор доставки, полученный методом ReceiveNotification. */
  receiptId: number;
}

/** Параметры подтверждения без учётных данных: они подставляются из стора. */
export type DeleteNotificationVariables = Omit<
  DeleteNotificationRequest,
  'idInstance' | 'apiTokenInstance'
>;

export type IncomingNotification = z.infer<typeof incomingNotificationSchema>;
export type ReceiveNotificationResponse = z.infer<typeof receiveNotificationResponseSchema>;
export type DeleteNotificationResponse = z.infer<typeof deleteNotificationResponseSchema>;

import type { z } from 'zod';
import type {
  deleteNotificationResponseSchema,
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

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

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

export type IncomingNotification = z.infer<typeof incomingNotificationSchema>;
export type ReceiveNotificationResponse = z.infer<typeof receiveNotificationResponseSchema>;
export type DeleteNotificationResponse = z.infer<typeof deleteNotificationResponseSchema>;

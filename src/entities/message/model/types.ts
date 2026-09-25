export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  isOutgoing: boolean;
  /** Unix-время в секундах. */
  timestamp: number;
  status?: MessageStatus;
  /** Имя отправителя. Приходит только для входящих сообщений. */
  senderName?: string;
}

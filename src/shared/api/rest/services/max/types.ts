import { z } from 'zod';
import type { sendMessageResponseSchema } from './schemas';

export interface MaxApiRequest {
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

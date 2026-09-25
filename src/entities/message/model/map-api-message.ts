import type { ChatHistoryMessage } from '@shared/api';

import type { ChatMessage, MessageStatus } from './types';

/** Типы сообщений MAX, которые считаем текстовыми (включая сообщения с цитатой). */
const TEXT_MESSAGE_TYPES = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage']);

const toStatus = (value?: string): MessageStatus | undefined =>
  value === 'sent' || value === 'delivered' || value === 'read' ? value : undefined;

/**
 * Приводит сообщение GetChatHistory к доменной модели. Для всего, что не текст (медиа, опросы,
 * геолокация, контакты, реакции и прочие типы), возвращает `null` — такие сообщения не показываем.
 */
export const mapApiMessage = (message: ChatHistoryMessage): ChatMessage | null => {
  const text = message.textMessage ?? '';

  if (!TEXT_MESSAGE_TYPES.has(message.typeMessage) || !text) return null;

  return {
    id: message.idMessage,
    chatId: message.chatId,
    text,
    isOutgoing: message.type === 'outgoing',
    timestamp: message.timestamp,
    status: toStatus(message.statusMessage),
    senderName: message.senderName,
  };
};

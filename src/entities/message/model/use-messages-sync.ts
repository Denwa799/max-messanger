import { useMaxReceiveNotifications } from '@shared/api';
import type { IncomingNotification } from '@shared/api';
import { logError } from '@shared/lib';

import { useMessagesStore } from './store';
import type { ChatMessage } from './types';

const MESSAGE_WEBHOOKS = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
]);

const toChatMessage = (notification: IncomingNotification): ChatMessage | null => {
  if (!MESSAGE_WEBHOOKS.has(notification.typeWebhook)) return null;

  const { idMessage, timestamp, senderData, messageData } = notification;
  const text = messageData?.textMessageData?.textMessage;

  if (!idMessage || !senderData || !text || messageData?.typeMessage !== 'textMessage') {
    return null;
  }

  return {
    id: idMessage,
    chatId: senderData.chatId,
    text,
    isOutgoing: notification.typeWebhook !== 'incomingMessageReceived',
    timestamp: timestamp ?? Math.floor(Date.now() / 1000),
  };
};

/**
 * Принимает входящие уведомления MAX и складывает текстовые сообщения в стор. Цикл
 * long-polling живёт, пока смонтирован вызов, поэтому держите его выше списка чатов.
 */
export const useMessagesSync = (): void => {
  const addMessage = useMessagesStore((state) => state.addMessage);

  useMaxReceiveNotifications({
    onNotification: (notification) => {
      const message = toChatMessage(notification.body);
      if (message) addMessage(message);
    },
    onError: (error) => logError(error, 'Не удалось получить уведомление MAX'),
  });
};

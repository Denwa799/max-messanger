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

/** Типы `messageData.typeMessage`, которые считаем текстом: обычное, расширенное и с цитатой. */
const TEXT_MESSAGE_TYPES = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage']);

/**
 * Текст нового сообщения: у обычного он в `textMessageData.textMessage`, у сообщения с цитатой —
 * в `extendedTextMessageData.text`. У удаления и правки текста нового сообщения нет — вернём
 * `undefined`, и такие уведомления обрабатываются отдельно.
 */
const getMessageText = (notification: IncomingNotification): string | undefined => {
  const { messageData } = notification;
  if (!messageData || !TEXT_MESSAGE_TYPES.has(messageData.typeMessage ?? '')) return undefined;

  return messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text;
};

const toChatMessage = (notification: IncomingNotification): ChatMessage | null => {
  const { idMessage, timestamp, senderData } = notification;
  const text = getMessageText(notification);

  if (!idMessage || !senderData || !text) return null;

  return {
    id: idMessage,
    chatId: senderData.chatId,
    text,
    isOutgoing: notification.typeWebhook !== 'incomingMessageReceived',
    timestamp: timestamp ?? Math.floor(Date.now() / 1000),
    // В группах и каналах по имени собираем серии подряд идущих сообщений одного автора.
    senderName: senderData.senderName,
  };
};

/**
 * Принимает входящие уведомления MAX и складывает текстовые сообщения в стор. Цикл
 * long-polling живёт, пока смонтирован вызов, поэтому держите его выше списка чатов.
 */
export const useMessagesSync = (): void => {
  const addMessage = useMessagesStore((state) => state.addMessage);
  const removeMessage = useMessagesStore((state) => state.removeMessage);
  const editMessage = useMessagesStore((state) => state.editMessage);

  useMaxReceiveNotifications({
    onNotification: ({ body }) => {
      if (!MESSAGE_WEBHOOKS.has(body.typeWebhook)) return;

      const { messageData } = body;

      // Удаление и правка меняют уже показанное сообщение, а не добавляют новое. Целевое
      // сообщение приходит в `stanzaId`, поэтому идём по нему, а не по `idMessage`.
      if (messageData?.typeMessage === 'deletedMessage') {
        const stanzaId = messageData.deletedMessageData?.stanzaId;
        if (stanzaId) removeMessage(stanzaId);
        return;
      }

      if (messageData?.typeMessage === 'editedMessage') {
        const edited = messageData.editedMessageData;
        if (edited?.stanzaId && edited.textMessage)
          editMessage(edited.stanzaId, edited.textMessage);
        return;
      }

      const message = toChatMessage(body);
      if (message) addMessage(message);
    },
    onError: (error) => logError(error, 'Не удалось получить уведомление MAX'),
  });
};

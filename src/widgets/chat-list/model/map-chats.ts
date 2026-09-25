import type { Chat as ApiChat } from '@shared/api';

import type { Chat } from './types';

const CHAT_TYPE_LABELS: Record<ApiChat['type'], string> = {
  user: 'Контакт',
  group: 'Группа',
  channel: 'Канал',
  bot: 'Бот',
};

/**
 * GetChats не отдаёт последнее сообщение, поэтому вместо него показываем номер телефона
 * контакта (если он не скрыт) или тип чата.
 */
const getSubtitle = (chat: ApiChat): string =>
  chat.type === 'user' && chat.phoneNumber ? `+${chat.phoneNumber}` : CHAT_TYPE_LABELS[chat.type];

export const mapChat = (chat: ApiChat): Chat => ({
  id: chat.chatId,
  title: chat.name,
  subtitle: getSubtitle(chat),
});

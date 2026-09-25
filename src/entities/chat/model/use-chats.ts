import { useMaxGetChats } from '@shared/api';
import { useIsInstanceConfigured } from '@shared/model';

import { mapApiChat } from './map-api-chat';
import { useAddedChats } from './store';

/**
 * Список чатов для интерфейса: ответ GetChats плюс чаты, добавленные вручную
 * (по номеру телефона), пока сервер их ещё не вернул.
 */
export const useChats = () => {
  const isConfigured = useIsInstanceConfigured();
  const query = useMaxGetChats({ enabled: isConfigured });
  const addedChats = useAddedChats();

  // Добавленные вручную чаты (по номеру) могут ещё не прийти в GetChats — показываем их сразу.
  const apiChats = query.data?.map(mapApiChat) ?? [];
  const apiChatIds = new Set(apiChats.map((chat) => chat.id));
  const chats = [...apiChats, ...addedChats.filter((chat) => !apiChatIds.has(chat.id))];

  return { ...query, chats };
};

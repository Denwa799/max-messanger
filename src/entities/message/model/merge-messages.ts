import type { ChatMessage } from './types';

/**
 * Сводит сообщения из разных источников в один список по возрастанию времени. Дубликаты по
 * `id` схлопываются: одно и то же сообщение приходит и в истории, и уведомлением. Значения из
 * `fresh` побеждают — так живое сообщение уточняет статус уже загруженного из истории.
 */
export const mergeMessages = (base: ChatMessage[], fresh: ChatMessage[]): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>();

  for (const message of base) byId.set(message.id, message);
  for (const message of fresh) byId.set(message.id, message);

  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
};

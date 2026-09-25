import type { ChatMessage } from './types';

/**
 * Сводит две версии одного сообщения. Текстовые поля и время берём из `fresh` — это более
 * свежий источник. Статус доставки и имя отправителя в живом сообщении из уведомления
 * отсутствуют, поэтому для них сохраняем значение из истории, иначе «галочки» и автор
 * пропадали бы после слияния с историей.
 */
const mergeMessage = (base: ChatMessage, fresh: ChatMessage): ChatMessage => ({
  ...base,
  ...fresh,
  status: fresh.status ?? base.status,
  senderName: fresh.senderName ?? base.senderName,
});

/**
 * Сводит сообщения из разных источников в один список по возрастанию времени. Дубликаты по
 * `id` схлопываются: одно и то же сообщение приходит и в истории, и уведомлением.
 */
export const mergeMessages = (base: ChatMessage[], fresh: ChatMessage[]): ChatMessage[] => {
  const byId = new Map<string, ChatMessage>();

  for (const message of base) byId.set(message.id, message);
  for (const message of fresh) {
    const existing = byId.get(message.id);
    byId.set(message.id, existing ? mergeMessage(existing, message) : message);
  }

  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
};

export interface Chat {
  id: string;
  title: string;
  /** Номер контакта или тип чата (группа, канал, бот) — подпись под именем. */
  subtitle?: string;
  avatarUrl?: string;
  /**
   * Поля ниже появятся, когда в список попадёт история сообщений: метод GetChats
   * отдаёт только идентификатор, имя, тип и номер чата.
   */
  time?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isOutgoing?: boolean;
  isRead?: boolean;
}

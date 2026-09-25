export interface Chat {
  id: string;
  title: string;
  preview: string;
  time: string;
  avatarUrl?: string;
  unreadCount?: number;
  isOutgoing?: boolean;
  isRead?: boolean;
  isPinned?: boolean;
}

import type { Chat } from './types';

export const mockChats: Chat[] = [
  {
    id: 'saved',
    title: 'Избранное',
    preview: 'Заметки, ссылки и файлы',
    time: '10:42',
    isPinned: true,
  },
  {
    id: 'user-1',
    title: 'Пользователь 1',
    preview: 'Текст последнего сообщения',
    time: '09:15',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: 'user-2',
    title: 'Пользователь 2',
    preview: 'Текст последнего сообщения',
    time: 'Вчера',
    isPinned: true,
    unreadCount: 2,
  },
  {
    id: 'group-1',
    title: 'Групповой чат',
    preview: 'Участник: текст сообщения',
    time: 'Вчера',
  },
  {
    id: 'support',
    title: 'Служба поддержки',
    preview: 'Автоматический ответ системы',
    time: 'Пн',
  },
  {
    id: 'user-3',
    title: 'Пользователь 3',
    preview: 'Текст последнего сообщения',
    time: 'Пн',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: 'channel-1',
    title: 'Канал новостей',
    preview: 'Анонс новой публикации',
    time: '12 сен',
    unreadCount: 1,
  },
];

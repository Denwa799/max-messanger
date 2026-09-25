import { Panel } from '@maxhub/max-ui';

import { useMessagesSync } from '@entities/message';
import { cn } from '@shared/lib';
import { SpacePatternBackground } from '@shared/ui';
import { ChatList } from '@widgets/chat-list';

export type ChatsPane = 'chats' | 'content';

declare module '@tanstack/router-core' {
  interface StaticDataRouteOption {
    activePane?: ChatsPane;
  }
}

interface ChatsLayoutProps {
  activePane?: ChatsPane;
  children?: React.ReactNode;
}

const SIDEBAR_CLASS_NAME = 'h-full w-full laptop:w-105 laptop:shrink-0';
const CONTENT_CLASS_NAME = 'relative min-w-0 flex-1';

export const ChatsLayout = ({ activePane = 'chats', children }: ChatsLayoutProps) => {
  // Приём входящих сообщений идёт фоном, пока открыт раздел чатов.
  useMessagesSync();

  return (
    <div className="flex h-full w-full">
      {/* На узких экранах показываем либо список чатов, либо открытую переписку. */}
      <div className={cn(SIDEBAR_CLASS_NAME, activePane === 'content' && 'max-laptop:hidden')}>
        <ChatList />
      </div>
      <Panel
        mode="secondary"
        className={cn(CONTENT_CLASS_NAME, activePane === 'chats' && 'max-laptop:hidden')}
      >
        <SpacePatternBackground className="absolute inset-0" />
        <div className="relative h-full w-full">{children}</div>
      </Panel>
    </div>
  );
};

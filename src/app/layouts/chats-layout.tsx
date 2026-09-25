import { Panel } from '@maxhub/max-ui';

import { cn } from '@shared/lib';
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
const CONTENT_CLASS_NAME = 'min-w-0 flex-1';

export const ChatsLayout = ({ activePane = 'chats', children }: ChatsLayoutProps) => {
  return (
    <div className="flex h-full w-full">
      <div className={cn(SIDEBAR_CLASS_NAME, activePane === 'content' && 'max-laptop:hidden')}>
        <ChatList />
      </div>
      <Panel
        mode="secondary"
        className={cn(CONTENT_CLASS_NAME, activePane === 'chats' && 'max-laptop:hidden')}
      >
        {children}
      </Panel>
    </div>
  );
};

import { Avatar, CellSimple, Counter, EllipsisText, Flex, Typography } from '@maxhub/max-ui';
import { CheckCheck, Pin } from 'lucide-react';

import type { Chat } from '@entities/chat';
import { cn, getInitials } from '@shared/lib';

interface ChatListItemProps {
  chat: Chat;
  separator?: boolean;
  selected?: boolean;
  onSelect: (chat: Chat) => void;
}

const ChatStatus = ({ chat }: { chat: Chat }) => {
  if (chat.unreadCount) {
    return <Counter value={chat.unreadCount} variant="primary" />;
  }

  if (chat.isOutgoing && chat.isRead) {
    return <CheckCheck size={16} className="text-text-themed" />;
  }

  return null;
};

export const ChatListItem = ({ chat, separator, selected, onSelect }: ChatListItemProps) => (
  <CellSimple
    separator={separator}
    role="button"
    tabIndex={0}
    aria-current={selected}
    onClick={() => onSelect(chat)}
    onKeyDown={(event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onSelect(chat);
    }}
    className={cn(
      'cursor-pointer transition-colors hover:bg-background-tertiary',
      selected && 'bg-background-tertiary',
    )}
    subtitleMode="secondary"
    before={
      <Avatar.Container size={52} form="circle">
        <Avatar.Image src={chat.avatarUrl} fallback={getInitials(chat.title)} />
      </Avatar.Container>
    }
    title={chat.title}
    subtitle={chat.subtitle ? <EllipsisText maxLines={1}>{chat.subtitle}</EllipsisText> : undefined}
    innerClassNames={{ after: 'self-start pt-0.75' }}
    after={
      <Flex align="center" gap={4}>
        <ChatStatus chat={chat} />
        {chat.time && (
          <Typography.Text variant="description" color="tertiary" className="whitespace-nowrap">
            {chat.time}
          </Typography.Text>
        )}
        {chat.isPinned && <Pin size={16} className="text-text-tertiary" />}
      </Flex>
    }
  />
);

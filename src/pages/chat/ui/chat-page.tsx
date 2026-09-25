import { Flex, Typography } from '@maxhub/max-ui';

import { useChats } from '@entities/chat';

import { Conversation } from './conversation';
import { ConversationSkeleton } from './conversation-skeleton';

interface ChatPageProps {
  chatId: string;
}

export const ChatPage = ({ chatId }: ChatPageProps) => {
  const { chats, isPending } = useChats();
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    if (isPending) return <ConversationSkeleton />;

    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={16}
        className="h-full w-full p-6 text-center"
      >
        <Typography.Text variant="body" color="secondary">
          Чат не найден
        </Typography.Text>
      </Flex>
    );
  }

  // key по id: при переходе в другой чат компонент перемонтируется, иначе черновик и
  // состояние отправки переносились бы из прошлой переписки.
  return <Conversation key={chat.id} chat={chat} />;
};

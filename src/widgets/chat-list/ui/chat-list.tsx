import {
  CellList,
  Flex,
  Icon16SearchOutline,
  IconButton,
  Input,
  Panel,
  Typography,
} from '@maxhub/max-ui';
import { Plus } from 'lucide-react';

import { mockChats } from '../model/mock-chats';
import { ChatListItem } from './chat-list-item';

export const ChatList = () => {
  return (
    <aside className="h-full w-full">
      <Panel mode="primary" className="flex h-full flex-col">
        <Flex align="center" justify="space-between" className="px-4 pt-4 pb-2">
          <Typography.Title variant="large-strong" asChild>
            <h1>Чаты</h1>
          </Typography.Title>
          <IconButton variant="primary" size="small" aria-label="Новый чат">
            <Plus />
          </IconButton>
        </Flex>

        <div className="px-4 pb-2">
          <Input
            size="medium"
            mode="default"
            iconBefore={<Icon16SearchOutline />}
            placeholder="Поиск"
            aria-label="Поиск по чатам"
          />
        </div>

        <CellList className="min-h-0 flex-1 overflow-y-auto">
          {mockChats.map((chat, index) => (
            <ChatListItem key={chat.id} chat={chat} separator={index > 0} />
          ))}
        </CellList>
      </Panel>
    </aside>
  );
};

import {
  CellAction,
  CellList,
  Flex,
  Icon16SearchOutline,
  IconButton,
  Input,
  Panel,
  Typography,
} from '@maxhub/max-ui';
import { LogOut, Plus } from 'lucide-react';
import { useState } from 'react';

import { clearInstanceCredentials } from '@shared/model';
import { ConfirmationDialog } from '@shared/ui';

import { mockChats } from '../model/mock-chats';
import { ChatListItem } from './chat-list-item';

export const ChatList = () => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutConfirm = () => {
    clearInstanceCredentials();
    setIsLogoutConfirmOpen(false);
  };

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

        <div className="border-t border-divider-secondary p-2">
          <CellAction
            mode="destructive"
            before={<LogOut size={20} />}
            onClick={() => setIsLogoutConfirmOpen(true)}
          >
            Выйти
          </CellAction>
        </div>
      </Panel>

      <ConfirmationDialog
        open={isLogoutConfirmOpen}
        title="Выйти из аккаунта?"
        description="Сохранённые idInstance и apiTokenInstance будут удалены — потребуется ввести их заново."
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </aside>
  );
};

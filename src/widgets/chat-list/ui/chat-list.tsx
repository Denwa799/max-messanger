import { useMatchRoute, useNavigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Button,
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
import { useRef, useState } from 'react';

import { resetChats, useChats } from '@entities/chat';
import type { Chat } from '@entities/chat';
import { resetMessages } from '@entities/message';
import { StartChatModal } from '@features/start-chat';
import { clearInstanceCredentials } from '@shared/model';
import { ConfirmationDialog } from '@shared/ui';

import { ChatListItem } from './chat-list-item';
import { ChatListSkeleton } from './chat-list-skeleton';

/** Приблизительная высота строки чата (аватар 52px + вертикальные отступы). */
const ROW_ESTIMATED_SIZE = 72;

/** Количество строк, отрисованных за пределами видимой области. */
const OVERSCAN = 8;

export const ChatList = () => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  // Пока инстанс не подключён, диалог ввода перекрывает экран — запрос не отправляем.
  const { chats, isPending, isError, error, refetch } = useChats();

  // Активный чат хранится в адресе страницы, а не в сторе.
  const chatMatch = matchRoute({ to: '/chat/$chatId', includeSearch: false });
  const selectedChatId = chatMatch ? chatMatch.chatId : undefined;

  const handleOpenChat = (chat: Chat) => {
    void navigate({ to: '/chat/$chatId', params: { chatId: chat.id } });
  };

  // oxlint-disable-next-line react/incompatible-library -- useVirtualizer возвращает функции, которые React Compiler намеренно не мемоизирует; использование безопасно.
  const virtualizer = useVirtualizer({
    count: chats.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_ESTIMATED_SIZE,
    getItemKey: (index) => chats[index].id,
    overscan: OVERSCAN,
  });

  const handleLogoutConfirm = () => {
    clearInstanceCredentials();
    resetChats();
    resetMessages();
    setIsLogoutConfirmOpen(false);
  };

  const renderContent = () => {
    if (isPending) {
      return <ChatListSkeleton />;
    }

    if (isError) {
      return (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={12}
          className="min-h-0 flex-1 px-6 text-center"
        >
          <Typography.Text variant="body" color="secondary">
            {error?.userMessage ?? 'Не удалось загрузить чаты'}
          </Typography.Text>
          <Button variant="secondary" size="medium" onClick={() => void refetch()}>
            Повторить
          </Button>
        </Flex>
      );
    }

    if (chats.length === 0) {
      return (
        <Flex align="center" justify="center" className="min-h-0 flex-1 px-6 text-center">
          <Typography.Text variant="body" color="secondary">
            Пока нет чатов. Начните новый по кнопке «+».
          </Typography.Text>
        </Flex>
      );
    }

    return (
      <CellList ref={scrollParentRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const chat = chats[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute inset-x-0 top-0"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <ChatListItem
                  chat={chat}
                  separator={virtualRow.index > 0}
                  selected={selectedChatId === chat.id}
                  onSelect={handleOpenChat}
                />
              </div>
            );
          })}
        </div>
      </CellList>
    );
  };

  return (
    <aside className="h-full w-full">
      <Panel mode="primary" className="flex h-full flex-col">
        <Flex align="center" justify="space-between" className="px-4 pt-4 pb-4">
          <Typography.Title variant="large-strong" asChild>
            <h1>Чаты</h1>
          </Typography.Title>
          <IconButton
            variant="primary"
            size="small"
            aria-label="Новый чат"
            onClick={() => setIsStartChatOpen(true)}
          >
            <Plus />
          </IconButton>
        </Flex>

        <div className="px-4 pb-4">
          <Input
            size="medium"
            mode="default"
            iconBefore={<Icon16SearchOutline />}
            placeholder="Поиск"
            aria-label="Поиск по чатам"
          />
        </div>

        {renderContent()}

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

      <StartChatModal open={isStartChatOpen} onClose={() => setIsStartChatOpen(false)} />

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

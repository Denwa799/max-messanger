import { useVirtualizer } from '@tanstack/react-virtual';
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
import { useRef, useState } from 'react';

import { clearInstanceCredentials } from '@shared/model';
import { ConfirmationDialog } from '@shared/ui';

import { mockChats } from '../model/mock-chats';
import { ChatListItem } from './chat-list-item';

/** Приблизительная высота строки чата (аватар 52px + вертикальные отступы). */
const ROW_ESTIMATED_SIZE = 72;

/** Количество строк, отрисованных за пределами видимой области. */
const OVERSCAN = 8;

export const ChatList = () => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const scrollParentRef = useRef<HTMLDivElement>(null);

  // oxlint-disable-next-line react/incompatible-library -- useVirtualizer возвращает функции, которые React Compiler намеренно не мемоизирует; использование безопасно.
  const virtualizer = useVirtualizer({
    count: mockChats.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_ESTIMATED_SIZE,
    getItemKey: (index) => mockChats[index].id,
    overscan: OVERSCAN,
  });

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

        <CellList ref={scrollParentRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const chat = mockChats[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute inset-x-0 top-0"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <ChatListItem chat={chat} separator={virtualRow.index > 0} />
                </div>
              );
            })}
          </div>
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

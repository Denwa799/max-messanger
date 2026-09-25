import { useNavigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Avatar, Button, Flex, IconButton, Spinner, Textarea, Typography } from '@maxhub/max-ui';
import { ArrowLeft, Check, CheckCheck, Send } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Chat } from '@entities/chat';
import { addMessage, useConversationMessages } from '@entities/message';
import type { ChatMessage, MessageStatus } from '@entities/message';
import { useMaxSendMessage } from '@shared/api';
import { cn, getInitials } from '@shared/lib';

interface ConversationProps {
  chat: Chat;
}

/** Приблизительная высота сообщения для виртуализатора: реальные размеры замеряются по факту. */
const ROW_ESTIMATE_SIZE = 64;

/** Количество сообщений, отрисованных за пределами видимой области. */
const OVERSCAN = 8;

/** Расстояние до края, при котором считаем, что пользователь «внизу» переписки (px). */
const BOTTOM_THRESHOLD = 64;

/** Расстояние до верхнего края, при котором подгружаем более старые сообщения (px). */
const TOP_THRESHOLD = 200;

/** Ширина колонки переписки: на широких экранах лента не растягивается на всю панель. */
const COLUMN_CLASS_NAME = 'relative mx-auto w-full max-w-3xl';

const formatTime = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

/** Ключ автора: по нему собираем подряд идущие сообщения в серии. */
const getAuthorKey = (message: ChatMessage): string =>
  message.isOutgoing ? 'me' : (message.senderName ?? '');

const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
  if (status === 'sent') return <Check size={13} className="shrink-0 opacity-80" />;
  if (status === 'delivered') return <CheckCheck size={13} className="shrink-0 opacity-80" />;
  if (status === 'read') return <CheckCheck size={13} className="shrink-0" />;

  return null;
};

interface MessageBubbleProps {
  message: ChatMessage;
  isFirstInSeries: boolean;
  showSenderName: boolean;
}

const MessageBubble = ({ message, isFirstInSeries, showSenderName }: MessageBubbleProps) => {
  const { isOutgoing } = message;

  // Скругляем «хвостовой» угол и углы, которыми сообщение стыкуется с соседями по серии.
  const radiusClassName = isOutgoing
    ? cn(
        'rounded-tl-2xl rounded-bl-2xl rounded-br-md',
        isFirstInSeries ? 'rounded-tr-2xl' : 'rounded-tr-md',
      )
    : cn(
        'rounded-tr-2xl rounded-br-2xl rounded-bl-md',
        isFirstInSeries ? 'rounded-tl-2xl' : 'rounded-tl-md',
      );

  return (
    <div className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-bubble px-3.5 py-2 shadow-sm tablet:max-w-bubble-tablet laptop:max-w-bubble-laptop',
          radiusClassName,
          isOutgoing
            ? 'bg-button-primary text-button-primary-contrast'
            : 'bg-background-tertiary text-text-primary',
        )}
      >
        {showSenderName && (
          <span className="mb-1 block text-sm leading-none font-medium text-text-themed">
            {message.senderName}
          </span>
        )}
        <Typography.Text
          variant="body"
          color="inherit"
          className="block whitespace-pre-wrap break-words"
        >
          {message.text}
          {/* Метка «плывёт» вправо по последней строке текста — короткие сообщения остаются в одну строку. */}
          <span
            className={cn(
              'float-right ml-2 flex translate-y-0.5 items-center gap-1 select-none',
              isOutgoing ? 'text-button-primary-contrast' : 'text-text-tertiary',
            )}
          >
            <span className={cn('text-xs leading-none tabular-nums', isOutgoing && 'opacity-80')}>
              {formatTime(message.timestamp)}
            </span>
            {isOutgoing && <MessageStatusIcon status={message.status} />}
          </span>
        </Typography.Text>
      </div>
    </div>
  );
};

const ConversationPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <Flex align="center" justify="center" className="h-full px-6 text-center">
    {children}
  </Flex>
);

export const Conversation = ({ chat }: ConversationProps) => {
  const { messages, isPending, isError, error, hasMore, isLoadingMore, loadMore, retry } =
    useConversationMessages(chat.id);
  const sendMessage = useMaxSendMessage();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Пользователь у нижнего края — туда же доскроллим при новом сообщении. */
  const atBottomRef = useRef(true);
  /** Позиция прокрутки до подгрузки старых сообщений, чтобы вернуть её после вставки. */
  const pendingPrependRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);

  // Имя отправителя имеет смысл только в группе или канале.
  const isGroupChat = chat.type === 'group' || chat.type === 'channel';

  // oxlint-disable-next-line react/incompatible-library -- useVirtualizer возвращает функции, которые React Compiler намеренно не мемоизирует; использование безопасно.
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE_SIZE,
    getItemKey: (index) => messages[index].id,
    overscan: OVERSCAN,
  });

  // При переходе в другой чат снова держимся за низ переписки.
  useEffect(() => {
    atBottomRef.current = true;
  }, [chat.id]);

  useEffect(() => {
    if (!messages.length || !atBottomRef.current) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [chat.id, messages.length]);

  // Подгрузка старых сообщений увеличивает высоту списка сверху — компенсируем сдвиг.
  useLayoutEffect(() => {
    const pending = pendingPrependRef.current;
    const element = scrollRef.current;
    if (!pending || !element) return;

    pendingPrependRef.current = null;
    element.scrollTop = element.scrollHeight - pending.scrollHeight + pending.scrollTop;
  }, [messages.length]);

  // Если подгрузка завершилась без новых сообщений (например, ошибка), ожидание сбрасываем,
  // чтобы следующее живое сообщение не сдвинуло переписку.
  useEffect(() => {
    if (!isLoadingMore) pendingPrependRef.current = null;
  }, [isLoadingMore]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    atBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < BOTTOM_THRESHOLD;

    if (element.scrollTop > TOP_THRESHOLD || !hasMore || isLoadingMore) return;

    pendingPrependRef.current = {
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    };
    loadMore();
  };

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;

    sendMessage.mutate(
      { chatId: chat.id, message: value },
      {
        onSuccess: (result) => {
          addMessage({
            id: result.idMessage,
            chatId: chat.id,
            text: value,
            isOutgoing: true,
            timestamp: Math.floor(Date.now() / 1000),
          });
          atBottomRef.current = true;
          setText('');
        },
      },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    handleSend();
  };

  const renderMessages = () => {
    if (isPending) {
      return (
        <ConversationPlaceholder>
          <Spinner size={24} />
        </ConversationPlaceholder>
      );
    }

    if (isError && messages.length === 0) {
      return (
        <ConversationPlaceholder>
          <Flex direction="column" align="center" gap={12}>
            <Typography.Text variant="body" color="secondary">
              {error?.userMessage ?? 'Не удалось загрузить сообщения'}
            </Typography.Text>
            <Button variant="secondary" size="medium" onClick={retry}>
              Повторить
            </Button>
          </Flex>
        </ConversationPlaceholder>
      );
    }

    if (messages.length === 0) {
      return (
        <ConversationPlaceholder>
          <Typography.Text variant="description" color="secondary">
            Начните переписку
          </Typography.Text>
        </ConversationPlaceholder>
      );
    }

    return (
      <div className={COLUMN_CLASS_NAME} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          const author = getAuthorKey(message);
          const previous = messages[virtualItem.index - 1];
          const next = messages[virtualItem.index + 1];
          const isFirstInSeries = !previous || getAuthorKey(previous) !== author;
          const isLastInSeries = !next || getAuthorKey(next) !== author;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={cn(
                'absolute inset-x-0 top-0 px-3 mobile:px-4',
                isLastInSeries ? 'pb-3' : 'pb-0.5',
              )}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <MessageBubble
                message={message}
                isFirstInSeries={isFirstInSeries}
                showSenderName={
                  isGroupChat &&
                  isFirstInSeries &&
                  !message.isOutgoing &&
                  Boolean(message.senderName)
                }
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <Flex align="center" gap={12} className="border-b border-divider-secondary px-4 py-3">
        <IconButton
          variant="ghost"
          size="small"
          className="laptop:hidden"
          aria-label="Назад к чатам"
          onClick={() => void navigate({ to: '/' })}
        >
          <ArrowLeft />
        </IconButton>
        <Avatar.Container size={40} form="circle">
          <Avatar.Image src={chat.avatarUrl} fallback={getInitials(chat.title)} />
        </Avatar.Container>
        <Flex direction="column" className="min-w-0">
          <Typography.Text variant="body-strong" className="truncate">
            {chat.title}
          </Typography.Text>
          {chat.subtitle && (
            <Typography.Text variant="description" color="tertiary" className="truncate">
              {chat.subtitle}
            </Typography.Text>
          )}
        </Flex>
      </Flex>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
          {renderMessages()}
        </div>
        {isLoadingMore && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
            <Spinner size={20} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-divider-secondary p-3">
        <Flex align="flex-end" gap={8}>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение"
            aria-label="Текст сообщения"
            rows={1}
            className="max-h-40 min-h-10 flex-1 resize-none"
          />
          <IconButton
            type="submit"
            variant="primary"
            size="medium"
            aria-label="Отправить"
            disabled={text.trim().length === 0}
            loading={sendMessage.isPending}
          >
            <Send size={20} />
          </IconButton>
        </Flex>
        {sendMessage.isError && (
          <Typography.Text variant="description" className="mt-1 block text-text-negative">
            {sendMessage.error?.userMessage ?? 'Не удалось отправить сообщение'}
          </Typography.Text>
        )}
      </form>
    </div>
  );
};

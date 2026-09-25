import { useNavigate } from '@tanstack/react-router';
import { Avatar, Flex, IconButton, Textarea, Typography } from '@maxhub/max-ui';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Chat } from '@entities/chat';
import { addMessage, useChatMessages } from '@entities/message';
import type { ChatMessage } from '@entities/message';
import { useMaxSendMessage } from '@shared/api';
import { cn, getInitials } from '@shared/lib';

interface ConversationProps {
  chat: Chat;
}

const formatTime = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const MessageBubble = ({ message }: { message: ChatMessage }) => (
  <div
    className={cn(
      'flex max-w-[80%] flex-col gap-0.5 rounded-2xl px-3 py-2',
      message.isOutgoing
        ? 'self-end bg-button-primary text-text-primary-inverse'
        : 'self-start bg-background-tertiary text-text-primary',
    )}
  >
    <Typography.Text variant="body" color="inherit" className="whitespace-pre-wrap break-words">
      {message.text}
    </Typography.Text>
    <Typography.Text variant="note" color="inherit" className="self-end opacity-70">
      {formatTime(message.timestamp)}
    </Typography.Text>
  </div>
);

export const Conversation = ({ chat }: ConversationProps) => {
  const messages = useChatMessages(chat.id);
  const sendMessage = useMaxSendMessage();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, chat.id]);

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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <Flex align="center" justify="center" className="flex-1">
            <Typography.Text variant="description" color="secondary">
              Начните переписку
            </Typography.Text>
          </Flex>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        <div ref={bottomRef} />
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

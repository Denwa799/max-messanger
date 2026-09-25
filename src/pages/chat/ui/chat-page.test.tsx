import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Chat } from '@entities/chat';
import { useChats } from '@entities/chat';

import { ChatPage } from './chat-page';

vi.mock('@entities/chat', () => ({ useChats: vi.fn() }));

vi.mock('./conversation', () => ({
  Conversation: ({ chat }: { chat: Chat }) => <div data-testid="conversation">{chat.id}</div>,
}));

const setChats = (chats: Chat[], isPending = false): void => {
  vi.mocked(useChats).mockReturnValue({
    chats,
    isPending,
  } as unknown as ReturnType<typeof useChats>);
};

const chat: Chat = { id: 'c1', title: 'Иван' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ChatPage', () => {
  it('показывает заглушку, пока список чатов загружается', () => {
    setChats([], true);

    const { container } = render(<ChatPage chatId="c1" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('сообщает, что чат не найден', () => {
    setChats([chat]);

    render(<ChatPage chatId="missing" />);

    expect(screen.getByText('Чат не найден')).toBeInTheDocument();
  });

  it('рендерит переписку для найденного чата', () => {
    setChats([chat]);

    render(<ChatPage chatId="c1" />);

    expect(screen.getByTestId('conversation')).toHaveTextContent('c1');
  });
});

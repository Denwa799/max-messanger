import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Chat } from '@entities/chat';
import { addMessage, useConversationMessages } from '@entities/message';
import type { ChatMessage } from '@entities/message';
import { useMaxSendMessage } from '@shared/api';

import { Conversation } from './conversation';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));

vi.mock('@entities/message', () => ({
  addMessage: vi.fn(),
  useConversationMessages: vi.fn(),
}));

vi.mock('@shared/api', () => ({ useMaxSendMessage: vi.fn() }));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({
    count,
    getItemKey,
  }: {
    count: number;
    getItemKey: (i: number) => unknown;
  }) => ({
    getTotalSize: () => count * 64,
    getVirtualItems: () =>
      Array.from({ length: count }, (_value, index) => ({
        index,
        key: getItemKey(index),
        start: index * 64,
      })),
    measureElement: () => {},
    scrollToIndex: () => {},
  }),
}));

interface SendCallbacks {
  onSuccess?: (result: { idMessage: string }) => void;
}

let sendCallbacks: SendCallbacks | undefined;

const sendMutate = vi.fn((_variables: unknown, options?: SendCallbacks) => {
  sendCallbacks = options;
});

const setConversation = (
  messages: ChatMessage[] = [],
  extra: Record<string, unknown> = {},
): void => {
  vi.mocked(useConversationMessages).mockReturnValue({
    messages,
    isPending: false,
    isError: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: vi.fn(),
    retry: vi.fn(),
    ...extra,
  } as unknown as ReturnType<typeof useConversationMessages>);
};

const setSend = (extra: Record<string, unknown> = {}): void => {
  vi.mocked(useMaxSendMessage).mockReturnValue({
    mutate: sendMutate,
    isPending: false,
    isError: false,
    error: null,
    ...extra,
  } as unknown as ReturnType<typeof useMaxSendMessage>);
};

const chat: Chat = { id: 'c1', title: 'Иван' };

const message = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm1',
  chatId: 'c1',
  text: 'Привет',
  isOutgoing: false,
  timestamp: 1_700_000_000,
  ...overrides,
});

const setup = (overrides: Partial<Chat> = {}) => {
  render(<Conversation chat={{ ...chat, ...overrides }} />);
};

beforeEach(() => {
  vi.clearAllMocks();
  sendCallbacks = undefined;
  setConversation();
  setSend();
});

describe('Conversation', () => {
  it('показывает сообщения чата', () => {
    setConversation([message({ text: 'Привет' })]);

    setup();

    expect(screen.getByText('Привет')).toBeInTheDocument();
  });

  it('показывает пустое состояние без сообщений', () => {
    setup();

    expect(screen.getByText('Начните переписку')).toBeInTheDocument();
  });

  it('показывает ошибку загрузки и повторяет запрос', async () => {
    const retry = vi.fn();
    setConversation([], { isError: true, error: { userMessage: 'Не вышло' }, retry });

    setup();

    expect(screen.getByText('Не вышло')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('показывает имя отправителя в групповом чате', () => {
    setConversation([message({ senderName: 'Пётр' })]);

    setup({ type: 'group' });

    expect(screen.getByText('Пётр')).toBeInTheDocument();
  });

  it('не показывает имя отправителя в личном чате', () => {
    setConversation([message({ senderName: 'Пётр' })]);

    setup({ type: 'user' });

    expect(screen.queryByText('Пётр')).not.toBeInTheDocument();
  });

  it('не показывает имя отправителя для исходящего сообщения', () => {
    setConversation([message({ senderName: 'Пётр', isOutgoing: true })]);

    setup({ type: 'group' });

    expect(screen.queryByText('Пётр')).not.toBeInTheDocument();
  });

  it('показывает шапку чата с именем и подписью', () => {
    setup({ title: 'Мария', subtitle: '+79991234567' });

    expect(screen.getByText('Мария')).toBeInTheDocument();
    expect(screen.getByText('+79991234567')).toBeInTheDocument();
  });

  it('возвращает к списку чатов по кнопке «Назад»', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Назад к чатам' }));

    expect(navigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('блокирует кнопку отправки при пустом поле', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled();
  });

  it('отправляет введённый текст', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('Текст сообщения'), 'Привет');
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(sendMutate).toHaveBeenCalledWith({ chatId: 'c1', message: 'Привет' }, expect.anything());
  });

  it('отправляет по Enter', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('Текст сообщения'), 'Привет{Enter}');

    expect(sendMutate).toHaveBeenCalledWith({ chatId: 'c1', message: 'Привет' }, expect.anything());
  });

  it('не отправляет по Shift+Enter', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('Текст сообщения'), 'Привет{Shift>}{Enter}{/Shift}');

    expect(sendMutate).not.toHaveBeenCalled();
  });

  it('добавляет отправленное сообщение и очищает поле', async () => {
    setup();
    const textarea = screen.getByLabelText('Текст сообщения');
    await userEvent.type(textarea, 'Привет');
    await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));

    act(() => sendCallbacks?.onSuccess?.({ idMessage: 'm-new' }));

    expect(addMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm-new', chatId: 'c1', text: 'Привет', isOutgoing: true }),
    );
    expect(textarea).toHaveValue('');
  });

  it('показывает причину ошибки отправки', () => {
    setSend({ isError: true, error: { userMessage: 'Не отправилось' } });

    setup();

    expect(screen.getByText('Не отправилось')).toBeInTheDocument();
  });
});

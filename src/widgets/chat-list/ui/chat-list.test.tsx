import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Chat } from '@entities/chat';
import { useChats } from '@entities/chat';

import { ChatList } from './chat-list';

const { navigate, matchRoute, logout } = vi.hoisted(() => ({
  navigate: vi.fn(),
  matchRoute: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useMatchRoute: () => matchRoute,
}));

vi.mock('@entities/chat', () => ({ useChats: vi.fn() }));

vi.mock('@features/logout', () => ({ useLogout: () => logout }));

vi.mock('@features/start-chat', () => ({ StartChatModal: () => null }));

// Виртуализатору в jsdom недоступны размеры — рендерим все строки подряд.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({
    count,
    getItemKey,
  }: {
    count: number;
    getItemKey: (i: number) => unknown;
  }) => ({
    getTotalSize: () => count * 72,
    getVirtualItems: () =>
      Array.from({ length: count }, (_value, index) => ({
        index,
        key: getItemKey(index),
        start: index * 72,
      })),
    measureElement: () => {},
  }),
}));

const makeChat = (overrides: Partial<Chat> = {}): Chat => ({
  id: 'c1',
  title: 'Иван',
  ...overrides,
});

const setChats = (overrides: Partial<ReturnType<typeof useChats>> = {}): void => {
  vi.mocked(useChats).mockReturnValue({
    chats: [],
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useChats>);
};

beforeEach(() => {
  vi.clearAllMocks();
  matchRoute.mockReturnValue(false);
  setChats();
});

describe('ChatList', () => {
  it('показывает скелет во время загрузки', () => {
    setChats({ isPending: true });

    const { container } = render(<ChatList />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('Чаты')).toBeInTheDocument();
  });

  it('показывает сообщение об ошибке и повторяет запрос', async () => {
    const refetch = vi.fn();
    setChats({ isError: true, error: { userMessage: 'Не вышло' } as never, refetch });

    render(<ChatList />);

    expect(screen.getByText('Не вышло')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('показывает пустое состояние без чатов', () => {
    render(<ChatList />);

    expect(screen.getByText(/Пока нет чатов/)).toBeInTheDocument();
  });

  it('рендерит список чатов', () => {
    setChats({
      chats: [makeChat({ id: 'c1', title: 'Иван' }), makeChat({ id: 'c2', title: 'Мария' })],
    });

    render(<ChatList />);

    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });

  it('открывает чат по клику', async () => {
    setChats({ chats: [makeChat({ id: 'c7', title: 'Иван' })] });
    render(<ChatList />);

    await userEvent.click(screen.getByRole('button', { name: /Иван/ }));

    expect(navigate).toHaveBeenCalledWith({ to: '/chat/$chatId', params: { chatId: 'c7' } });
  });

  it('фильтрует чаты по поиску', async () => {
    setChats({
      chats: [makeChat({ id: 'c1', title: 'Иван' }), makeChat({ id: 'c2', title: 'Мария' })],
    });
    render(<ChatList />);

    await userEvent.type(screen.getByLabelText('Поиск по чатам'), 'Мар');

    expect(screen.queryByText('Иван')).not.toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
  });

  it('показывает пустой результат поиска', async () => {
    setChats({ chats: [makeChat({ title: 'Иван' })] });
    render(<ChatList />);

    await userEvent.type(screen.getByLabelText('Поиск по чатам'), 'нет такого');

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
  });

  it('помечает активный чат из адреса', () => {
    matchRoute.mockReturnValue({ chatId: 'c1' });
    setChats({ chats: [makeChat({ id: 'c1', title: 'Иван' })] });

    render(<ChatList />);

    expect(screen.getByRole('button', { name: /Иван/ })).toHaveAttribute('aria-current', 'true');
  });

  it('выходит из аккаунта после подтверждения', async () => {
    setChats({ chats: [makeChat({ title: 'Иван' })] });
    render(<ChatList />);

    await userEvent.click(screen.getByRole('button', { name: 'Выйти' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Выйти' }));

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith({ to: '/' });
  });
});

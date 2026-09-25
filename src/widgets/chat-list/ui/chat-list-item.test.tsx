import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Chat } from '@entities/chat';

import { ChatListItem } from './chat-list-item';

const makeChat = (overrides: Partial<Chat> = {}): Chat => ({
  id: 'c1',
  title: 'Иван Петров',
  ...overrides,
});

const setup = (chat: Partial<Chat> = {}, props: { selected?: boolean } = {}) => {
  const onSelect = vi.fn();

  render(<ChatListItem chat={makeChat(chat)} selected={props.selected} onSelect={onSelect} />);

  return { onSelect, button: screen.getByRole('button') };
};

describe('ChatListItem', () => {
  it('показывает имя чата', () => {
    setup();

    expect(screen.getByText('Иван Петров')).toBeInTheDocument();
  });

  it('показывает подпись, когда она задана', () => {
    setup({ subtitle: '+79991234567' });

    expect(screen.getByText('+79991234567')).toBeInTheDocument();
  });

  it('вызывает onSelect с чатом по клику', async () => {
    const { onSelect, button } = setup();

    await userEvent.click(button);

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it.each(['Enter', ' '])('вызывает onSelect по клавише %s', (key) => {
    const { onSelect, button } = setup();

    fireEvent.keyDown(button, { key });

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('игнорирует прочие клавиши', () => {
    const { onSelect, button } = setup();

    fireEvent.keyDown(button, { key: 'a' });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('помечает выбранный чат через aria-current', () => {
    setup({}, { selected: true });

    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'true');
  });

  it('показывает счётчик непрочитанных', () => {
    setup({ unreadCount: 5 });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('не показывает счётчик при нуле непрочитанных', () => {
    setup({ unreadCount: 0 });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

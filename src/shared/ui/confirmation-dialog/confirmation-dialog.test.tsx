import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmationDialog } from './confirmation-dialog';

const setup = (props: Partial<ComponentProps<typeof ConfirmationDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  const result = render(
    <ConfirmationDialog
      open
      title="Выйти из аккаунта?"
      description="Данные будут удалены"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onConfirm, onCancel, ...result };
};

describe('ConfirmationDialog', () => {
  it('ничего не рендерит в закрытом состоянии', () => {
    const { container } = render(
      <ConfirmationDialog open={false} title="Т" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('показывает заголовок и описание', () => {
    setup();

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Выйти из аккаунта?');
    expect(screen.getByText('Данные будут удалены')).toBeInTheDocument();
  });

  it('связывает описание через aria-describedby', () => {
    setup();

    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Данные будут удалены');
  });

  it('не ссылается на описание, если его нет', () => {
    setup({ description: undefined });

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('показывает кнопки с переданными подписями', () => {
    setup({ confirmLabel: 'Удалить', cancelLabel: 'Закрыть' });

    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument();
  });

  it('вызывает onConfirm по кнопке подтверждения', async () => {
    const { onConfirm, onCancel } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('вызывает onCancel по кнопке отмены', async () => {
    const { onConfirm, onCancel } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('вызывает onCancel по нажатию Escape', () => {
    const { onCancel } = setup();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('не реагирует на Escape, когда закрыт', () => {
    const onCancel = vi.fn();
    render(<ConfirmationDialog open={false} title="Т" onConfirm={vi.fn()} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('вызывает onCancel по клику на фон', () => {
    const { onCancel } = setup();
    const dialog = screen.getByRole('dialog');

    fireEvent.click(dialog.parentElement!);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('не вызывает onCancel по клику внутри диалога', () => {
    const { onCancel } = setup();

    fireEvent.click(screen.getByRole('dialog'));

    expect(onCancel).not.toHaveBeenCalled();
  });
});

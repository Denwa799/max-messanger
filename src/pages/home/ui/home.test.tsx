import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Home } from './home';

vi.mock('@features/start-chat', () => ({
  StartChatModal: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Новый чат" /> : null,
}));

describe('Home', () => {
  it('показывает подсказку и кнопку создания чата', () => {
    render(<Home />);

    expect(screen.getByText(/Выберите чат слева/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Новый чат' })).toBeInTheDocument();
  });

  it('открывает модалку создания чата по кнопке', async () => {
    render(<Home />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Новый чат' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

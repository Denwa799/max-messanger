import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addChat } from '@entities/chat';
import { useMaxCheckAccount, useMaxGetContacts } from '@shared/api';
import type { Contact } from '@shared/api';

import { StartChatModal } from './start-chat-modal';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@shared/api', () => ({ useMaxGetContacts: vi.fn(), useMaxCheckAccount: vi.fn() }));
vi.mock('@entities/chat', () => ({ addChat: vi.fn() }));

interface MutationCallbacks {
  onSuccess?: (result: { exist: boolean; chatId?: string }) => void;
  onError?: (error: { userMessage?: string; description?: string }) => void;
}

let callbacks: MutationCallbacks | undefined;

const mutate = vi.fn((_variables: unknown, options?: MutationCallbacks) => {
  callbacks = options;
});
const resetMutation = vi.fn();

const setContacts = (data: Contact[] = [], extra: Record<string, unknown> = {}): void => {
  vi.mocked(useMaxGetContacts).mockReturnValue({
    data,
    isPending: false,
    isError: false,
    ...extra,
  } as unknown as ReturnType<typeof useMaxGetContacts>);
};

const contact = (overrides: Partial<Contact> = {}): Contact => ({
  chatId: 'c1',
  name: '',
  contactName: 'Иван',
  type: 'user',
  phoneNumber: 79991234567,
  ...overrides,
});

const setup = (props: { open?: boolean } = {}) => {
  const onClose = vi.fn();

  render(<StartChatModal open={props.open ?? true} onClose={onClose} />);

  return { onClose };
};

beforeEach(() => {
  vi.clearAllMocks();
  callbacks = undefined;
  setContacts([]);
  vi.mocked(useMaxCheckAccount).mockReturnValue({
    mutate,
    reset: resetMutation,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useMaxCheckAccount>);
});

describe('StartChatModal', () => {
  it('ничего не рендерит в закрытом состоянии', () => {
    setup({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('показывает заголовок и форму ввода номера', () => {
    setup();

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Новый чат');
    expect(screen.getByLabelText('Номер телефона')).toBeInTheDocument();
  });

  it('показывает контакты из загруженного списка', () => {
    setContacts([contact({ chatId: 'c1', contactName: 'Иван' })]);

    setup();

    expect(screen.getByText('Иван')).toBeInTheDocument();
  });

  it('подставляет идентификатор чата, когда имя и номер недоступны', () => {
    setContacts([contact({ chatId: 'ch-42', contactName: '', name: '', phoneNumber: 0 })]);

    setup();

    expect(screen.getByText('ch-42')).toBeInTheDocument();
  });

  it('фильтрует контакты по строке поиска', async () => {
    setContacts([
      contact({ chatId: 'c1', contactName: 'Иван' }),
      contact({ chatId: 'c2', contactName: 'Пётр' }),
    ]);
    setup();

    await userEvent.type(screen.getByLabelText('Номер телефона'), 'Иван');

    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.queryByText('Пётр')).not.toBeInTheDocument();
  });

  it('показывает пустое состояние без контактов', () => {
    setup();

    expect(screen.getByText('Нет контактов')).toBeInTheDocument();
  });

  it('отклоняет некорректный номер без обращения к API', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('Номер телефона'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Начать чат' }));

    expect(screen.getByText('Введите номер в формате 79991234567')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('проверяет аккаунт по введённому номеру', async () => {
    setup();

    await userEvent.type(screen.getByLabelText('Номер телефона'), '+7 (999) 123-45-67');
    await userEvent.click(screen.getByRole('button', { name: 'Начать чат' }));

    expect(mutate).toHaveBeenCalledWith({ phoneNumber: 79991234567 }, expect.anything());
  });

  it('открывает чат, когда аккаунт найден', async () => {
    const { onClose } = setup();
    await userEvent.type(screen.getByLabelText('Номер телефона'), '79991234567');
    await userEvent.click(screen.getByRole('button', { name: 'Начать чат' }));

    act(() => callbacks?.onSuccess?.({ exist: true, chatId: 'c2' }));

    expect(addChat).toHaveBeenCalledWith({ id: 'c2', title: '+79991234567' });
    expect(navigate).toHaveBeenCalledWith({ to: '/chat/$chatId', params: { chatId: 'c2' } });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('сообщает, когда аккаунт не найден', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Номер телефона'), '79991234567');
    await userEvent.click(screen.getByRole('button', { name: 'Начать чат' }));

    act(() => callbacks?.onSuccess?.({ exist: false }));

    expect(screen.getByText('Аккаунт с таким номером не найден в MAX')).toBeInTheDocument();
    expect(addChat).not.toHaveBeenCalled();
  });

  it('показывает причину из ошибки мутации', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Номер телефона'), '79991234567');
    await userEvent.click(screen.getByRole('button', { name: 'Начать чат' }));

    act(() => callbacks?.onError?.({ userMessage: 'Плохо', description: 'подробности' }));

    expect(screen.getByText('Плохо: подробности')).toBeInTheDocument();
  });

  it('открывает чат по клику на контакт', async () => {
    setContacts([contact({ chatId: 'c9', contactName: 'Мария', phoneNumber: 79990000000 })]);
    const { onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: /Мария/ }));

    expect(addChat).toHaveBeenCalledWith({
      id: 'c9',
      title: 'Мария',
      subtitle: '+79990000000',
    });
    expect(navigate).toHaveBeenCalledWith({ to: '/chat/$chatId', params: { chatId: 'c9' } });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('закрывается по Escape', async () => {
    const { onClose } = setup();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });
});

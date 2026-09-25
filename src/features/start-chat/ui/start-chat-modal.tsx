import {
  Avatar,
  Button,
  Flex,
  Icon16SearchOutline,
  Input,
  Panel,
  Spinner,
  Typography,
} from '@maxhub/max-ui';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { addChat } from '@entities/chat';
import { useMaxCheckAccount, useMaxGetContacts } from '@shared/api';
import type { Contact } from '@shared/api';
import { getInitials } from '@shared/lib';

import { startChatSchema } from '../model/schema';

interface StartChatModalProps {
  open: boolean;
  onClose: () => void;
}

const TITLE_ID = 'start-chat-title';
const MAX_VISIBLE_CONTACTS = 50;

const BACKDROP_CLASS_NAME =
  'fixed inset-0 z-50 flex items-center justify-center bg-background-overlay p-4';
const DIALOG_CLASS_NAME =
  'h-auto max-h-full w-full max-w-md overflow-y-auto rounded-floating shadow-2xl';

const getContactTitle = (contact: Contact): string =>
  // При phoneNumber = 0 номер скрыт или это бот — показываем идентификатор чата.
  contact.contactName ||
  contact.name ||
  (contact.phoneNumber > 0 ? `+${contact.phoneNumber}` : contact.chatId);

export const StartChatModal = ({ open, onClose }: StartChatModalProps) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const contactsQuery = useMaxGetContacts({ enabled: open });
  const checkAccount = useMaxCheckAccount();
  const navigate = useNavigate();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setQuery('');
    setError(null);
    checkAccount.reset();
    onClose();
  };

  const startChat = (chat: { id: string; title: string; subtitle?: string }) => {
    addChat(chat);
    handleClose();
    void navigate({ to: '/chat/$chatId', params: { chatId: chat.id } });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkAccount.isPending) return;
    setError(null);

    const parsed = startChatSchema.safeParse({ phoneNumber: query });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Введите номер телефона');
      return;
    }

    const { phoneNumber } = parsed.data;
    checkAccount.mutate(
      { phoneNumber: Number(phoneNumber) },
      {
        onSuccess: (result) => {
          if (result.exist && result.chatId) {
            startChat({ id: result.chatId, title: `+${phoneNumber}` });
            return;
          }
          setError('Аккаунт с таким номером не найден в MAX');
        },
        onError: (mutationError) => {
          const message = mutationError.userMessage ?? 'Не удалось проверить номер';
          setError(
            mutationError.description ? `${message}: ${mutationError.description}` : message,
          );
        },
      },
    );
  };

  const normalizedQuery = query.trim().toLowerCase();
  const digits = query.replace(/\D/g, '');
  const contacts = contactsQuery.data ?? [];
  const filteredContacts = normalizedQuery
    ? contacts.filter(
        (contact) =>
          getContactTitle(contact).toLowerCase().includes(normalizedQuery) ||
          (digits.length > 0 &&
            contact.phoneNumber > 0 &&
            String(contact.phoneNumber).includes(digits)),
      )
    : contacts;

  const renderContacts = () => {
    if (contactsQuery.isPending) {
      return (
        <Flex align="center" justify="center" className="py-6">
          <Spinner size={20} appearance="primary" />
        </Flex>
      );
    }

    if (contactsQuery.isError) {
      return (
        <Typography.Text variant="description" color="secondary">
          Не удалось загрузить контакты
        </Typography.Text>
      );
    }

    if (filteredContacts.length === 0) {
      return (
        <Typography.Text variant="description" color="secondary">
          {normalizedQuery ? 'Ничего не найдено' : 'Нет контактов'}
        </Typography.Text>
      );
    }

    return (
      <div className="flex max-h-64 flex-col overflow-y-auto">
        {filteredContacts.slice(0, MAX_VISIBLE_CONTACTS).map((contact) => (
          <button
            key={contact.chatId}
            type="button"
            onClick={() =>
              startChat({
                id: contact.chatId,
                title: getContactTitle(contact),
                subtitle: contact.phoneNumber ? `+${contact.phoneNumber}` : undefined,
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-background-tertiary"
          >
            <Avatar.Container size={40} form="circle">
              <Avatar.Image fallback={getInitials(getContactTitle(contact))} />
            </Avatar.Container>
            <Flex direction="column" className="min-w-0">
              <Typography.Text variant="body" className="truncate">
                {getContactTitle(contact)}
              </Typography.Text>
              {contact.phoneNumber > 0 && (
                <Typography.Text variant="description" color="tertiary">
                  {`+${contact.phoneNumber}`}
                </Typography.Text>
              )}
            </Flex>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={BACKDROP_CLASS_NAME} onClick={handleClose}>
      <Panel
        mode="primary"
        className={DIALOG_CLASS_NAME}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 pb-4">
          <Flex direction="column" gap={8}>
            <Typography.Title variant="small-strong" asChild>
              <h2 id={TITLE_ID}>Новый чат</h2>
            </Typography.Title>
            <Typography.Text variant="description" color="secondary">
              Введите номер телефона в международном формате — проверим, зарегистрирован ли аккаунт
              в MAX. Или выберите контакт из списка ниже.
            </Typography.Text>
          </Flex>

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="79991234567"
            inputMode="tel"
            autoComplete="off"
            autoFocus
            aria-label="Номер телефона"
            aria-invalid={Boolean(error)}
            iconBefore={<Icon16SearchOutline />}
            withClearButton
            hint={error ? <span className="text-text-negative">{error}</span> : undefined}
          />

          <Button type="submit" size="large" stretched loading={checkAccount.isPending}>
            Начать чат
          </Button>
        </form>

        <div className="flex flex-col gap-3 border-t border-divider-secondary px-6 py-4">
          <Typography.Label variant="small-strong" asChild>
            <span>Контакты</span>
          </Typography.Label>
          {renderContacts()}
        </div>
      </Panel>
    </div>
  );
};

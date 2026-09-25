import { describe, expect, it } from 'vitest';

import type { Chat as ApiChat } from '@shared/api';

import { mapApiChat } from './map-api-chat';

const makeApiChat = (overrides: Partial<ApiChat> = {}): ApiChat => ({
  chatId: 'chat-1',
  name: 'Иван Петров',
  type: 'user',
  phoneNumber: 79991234567,
  ...overrides,
});

describe('mapApiChat', () => {
  it('переносит id, имя и тип', () => {
    const result = mapApiChat(makeApiChat({ chatId: 'c-42', name: 'Мария', type: 'user' }));

    expect(result).toMatchObject({ id: 'c-42', title: 'Мария', type: 'user' });
  });

  it('для личного чата показывает номер телефона с плюсом', () => {
    const result = mapApiChat(makeApiChat({ type: 'user', phoneNumber: 79991234567 }));

    expect(result.subtitle).toBe('+79991234567');
  });

  it('для личного чата без номера показывает тип «Контакт»', () => {
    const result = mapApiChat(makeApiChat({ type: 'user', phoneNumber: 0 }));

    expect(result.subtitle).toBe('Контакт');
  });

  it.each([
    ['group', 'Группа'],
    ['channel', 'Канал'],
    ['bot', 'Бот'],
  ] as const)('для типа %s показывает подпись «%s»', (type, label) => {
    const result = mapApiChat(makeApiChat({ type, phoneNumber: 0 }));

    expect(result.subtitle).toBe(label);
  });

  it('игнорирует номер телефона у группы, показывая тип', () => {
    const result = mapApiChat(makeApiChat({ type: 'group', phoneNumber: 79990000000 }));

    expect(result.subtitle).toBe('Группа');
  });
});

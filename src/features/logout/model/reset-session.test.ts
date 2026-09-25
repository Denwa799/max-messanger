import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetChats } from '@entities/chat';
import { resetMessages } from '@entities/message';
import { clearInstanceCredentials } from '@shared/model';

import { resetSessionState } from './reset-session';

// Сброс каждого слоя состояния покрыт собственными тестами сторов, здесь проверяем,
// что `resetSessionState` вызывает их все и очищает кеш запросов.
vi.mock('@shared/model', () => ({ clearInstanceCredentials: vi.fn() }));
vi.mock('@entities/chat', () => ({ resetChats: vi.fn() }));
vi.mock('@entities/message', () => ({ resetMessages: vi.fn() }));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient();
});

describe('resetSessionState', () => {
  it('сбрасывает учётные данные', () => {
    resetSessionState(queryClient);

    expect(clearInstanceCredentials).toHaveBeenCalledOnce();
  });

  it('сбрасывает добавленные чаты', () => {
    resetSessionState(queryClient);

    expect(resetChats).toHaveBeenCalledOnce();
  });

  it('сбрасывает сообщения', () => {
    resetSessionState(queryClient);

    expect(resetMessages).toHaveBeenCalledOnce();
  });

  it('очищает кеш запросов', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear');

    resetSessionState(queryClient);

    expect(clearSpy).toHaveBeenCalledOnce();
  });
});

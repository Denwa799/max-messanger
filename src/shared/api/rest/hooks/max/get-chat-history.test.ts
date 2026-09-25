import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstanceCredentialsStore } from '@shared/model';

import { MaxService } from '../../services/max';
import type { ChatHistoryMessage } from '../../services/max/types';
import {
  CHAT_HISTORY_MAX_DEPTH,
  CHAT_HISTORY_PAGE_SIZE,
  maxGetChatHistoryQueryKey,
  maxGetChatHistoryQueryOptions,
} from './get-chat-history';

vi.mock('../../services/max', () => ({
  MaxService: { getChatHistory: vi.fn() },
}));

const makeHistory = (count: number): ChatHistoryMessage[] =>
  Array.from({ length: count }, (_value, index) => ({
    type: 'incoming',
    idMessage: `m-${index}`,
    timestamp: index,
    typeMessage: 'textMessage',
    chatId: 'c1',
    textMessage: `Сообщение ${index}`,
  }));

beforeEach(() => {
  useInstanceCredentialsStore
    .getState()
    .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
});

describe('maxGetChatHistoryQueryKey', () => {
  it('включает chatId в ключ чата', () => {
    expect(maxGetChatHistoryQueryKey('1', 'c1')).toEqual(['max', '1', 'getChatHistory', 'c1']);
  });
});

describe('maxGetChatHistoryQueryOptions', () => {
  it('отрезает уже загруженный хвост от ответа', async () => {
    vi.mocked(MaxService.getChatHistory).mockResolvedValue(makeHistory(200));
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    const page = await options.queryFn!({ pageParam: 200 } as never);

    expect(page).toHaveLength(CHAT_HISTORY_PAGE_SIZE);
    expect(page[0].idMessage).toBe('m-100');
  });

  it('для первой страницы возвращает весь ответ', async () => {
    vi.mocked(MaxService.getChatHistory).mockResolvedValue(makeHistory(50));
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    const page = await options.queryFn!({ pageParam: CHAT_HISTORY_PAGE_SIZE } as never);

    expect(page).toHaveLength(50);
  });

  it('запрашивает историю с учётными данными из стора и размером страницы', async () => {
    vi.mocked(MaxService.getChatHistory).mockResolvedValue([]);
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    await options.queryFn!({ pageParam: 100 } as never);

    expect(MaxService.getChatHistory).toHaveBeenCalledWith({
      idInstance: '1',
      apiTokenInstance: 'token',
      chatId: 'c1',
      count: 100,
    });
  });

  it('начинает с размера страницы', () => {
    expect(maxGetChatHistoryQueryOptions('1', 'c1').initialPageParam).toBe(CHAT_HISTORY_PAGE_SIZE);
  });

  it('продолжает подгрузку, пока страница полная', () => {
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    expect(options.getNextPageParam!(makeHistory(100), [], 100, [])).toBe(200);
  });

  it('останавливается на неполной странице', () => {
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    expect(options.getNextPageParam!(makeHistory(99), [], 100, [])).toBeUndefined();
  });

  it('не уходит глубже предельной глубины истории', () => {
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    expect(
      options.getNextPageParam!(makeHistory(100), [], CHAT_HISTORY_MAX_DEPTH, []),
    ).toBeUndefined();
  });

  it('выключен, пока инстанс не подключён', () => {
    useInstanceCredentialsStore.getState().resetCredentials();

    expect(maxGetChatHistoryQueryOptions('', 'c1').enabled).toBe(false);
  });

  it('выключен, если вызывающий код передал enabled: false', () => {
    expect(maxGetChatHistoryQueryOptions('1', 'c1', false).enabled).toBe(false);
  });

  it('включён для подключённого инстанса', () => {
    expect(maxGetChatHistoryQueryOptions('1', 'c1').enabled).toBe(true);
  });

  it('не перезапрашивает историю по фокусу окна', () => {
    const options = maxGetChatHistoryQueryOptions('1', 'c1');

    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.staleTime).toBe(30_000);
  });
});

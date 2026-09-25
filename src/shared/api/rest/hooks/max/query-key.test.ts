import { describe, expect, it } from 'vitest';

import { maxQueryKey } from './query-key';

describe('maxQueryKey', () => {
  it('включает idInstance, чтобы кеш разных инстансов не смешивался', () => {
    expect(maxQueryKey('1101000000', 'getChats')).toEqual(['max', '1101000000', 'getChats']);
  });

  it('добавляет дополнительные части ключа по порядку', () => {
    expect(maxQueryKey('1', 'getChatHistory', 'chat-1')).toEqual([
      'max',
      '1',
      'getChatHistory',
      'chat-1',
    ]);
  });

  it('работает без дополнительных частей', () => {
    expect(maxQueryKey('1')).toEqual(['max', '1']);
  });
});

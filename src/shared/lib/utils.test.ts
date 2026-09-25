import { afterEach, describe, expect, it, vi } from 'vitest';

import { logError } from './utils';

describe('logError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ничего не логирует, если нечего показывать', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError();

    expect(spy).not.toHaveBeenCalled();
  });

  it('логирует сообщение и ошибку', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    logError(error, 'Контекст');

    expect(spy).toHaveBeenNthCalledWith(1, 'Контекст');
    expect(spy).toHaveBeenNthCalledWith(2, error);
  });

  it('логирует только ошибку, когда сообщения нет', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    logError(error);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(error);
  });

  it('логирует только сообщение, когда ошибки нет', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError(undefined, 'Только текст');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('Только текст');
  });
});

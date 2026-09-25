import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstanceCredentialsStore } from '@shared/model';

import { MaxApiError } from '../../client';
import { MaxService } from '../../services/max';

import { useMaxReceiveNotifications } from './receive-notification';

vi.mock('../../services/max', () => ({
  MaxService: { receiveNotification: vi.fn(), deleteNotification: vi.fn() },
}));

const receive = vi.mocked(MaxService.receiveNotification);
const remove = vi.mocked(MaxService.deleteNotification);

const credentials = { idInstance: '1', apiTokenInstance: 'token' };

/** Заглушка «ожидания» следующего уведомления — держит цикл на паузе. */
const pending = () => new Promise<never>(() => {});

const setCredentials = (): void => {
  useInstanceCredentialsStore.getState().setCredentials(credentials);
};

beforeEach(() => {
  setCredentials();
});

afterEach(() => {
  useInstanceCredentialsStore.getState().resetCredentials();
  vi.useRealTimers();
});

describe('useMaxReceiveNotifications', () => {
  it('не запускает цикл без учётных данных', () => {
    useInstanceCredentialsStore.getState().resetCredentials();

    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn() }));

    expect(receive).not.toHaveBeenCalled();
  });

  it('не запускает цикл при enabled: false', () => {
    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn(), enabled: false }));

    expect(receive).not.toHaveBeenCalled();
  });

  it('получает уведомление, обрабатывает и подтверждает его', async () => {
    const notification = { receiptId: 7, body: { typeWebhook: 'incomingMessageReceived' } };
    receive.mockResolvedValueOnce(notification).mockImplementation(pending);
    remove.mockResolvedValue({ result: true });
    const onNotification = vi.fn();

    renderHook(() => useMaxReceiveNotifications({ onNotification }));

    await waitFor(() => expect(remove).toHaveBeenCalledOnce());
    expect(onNotification).toHaveBeenCalledWith(notification);
    expect(remove).toHaveBeenCalledWith({ ...credentials, receiptId: 7 });
  });

  it('продолжает опрос, если уведомление не пришло (таймаут ожидания)', async () => {
    receive.mockResolvedValueOnce(null).mockImplementation(pending);

    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn() }));

    await waitFor(() => expect(receive).toHaveBeenCalledTimes(2));
    expect(remove).not.toHaveBeenCalled();
  });

  it('останавливается на неретраибельной ошибке и сообщает о ней', async () => {
    receive.mockRejectedValue(new MaxApiError('bad token', { status: 400 }));
    const onError = vi.fn();

    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn(), onError }));

    await waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(onError.mock.calls[0][0]).toBeInstanceOf(MaxApiError);
    expect(receive).toHaveBeenCalledOnce();
  });

  it('не повторяет протокольную ошибку разбора', async () => {
    receive.mockRejectedValue(new MaxApiError('bad schema', { isProtocolError: true }));
    const onError = vi.fn();

    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn(), onError }));

    await waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(receive).toHaveBeenCalledOnce();
  });

  it('повторяет запрос после сетевой ошибки', async () => {
    vi.useFakeTimers();
    receive.mockRejectedValueOnce(new MaxApiError('network')).mockImplementation(pending);
    const onError = vi.fn();

    renderHook(() => useMaxReceiveNotifications({ onNotification: vi.fn(), onError }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(onError).toHaveBeenCalledOnce();
    expect(receive).toHaveBeenCalledOnce();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(receive).toHaveBeenCalledTimes(2);
  });
});

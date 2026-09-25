import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstanceCredentialsStore } from './store';
import { initInstanceCredentialsSync } from './sync';

type MessageListener = (event: MessageEvent<unknown>) => void;

/** Подмена BroadcastChannel: перехватывает подписки и отправленные сообщения. */
class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];
  readonly posted: unknown[] = [];
  closed = false;
  private readonly listeners = new Set<MessageListener>();

  constructor(readonly name: string) {
    FakeBroadcastChannel.instances.push(this);
  }

  addEventListener(type: string, listener: MessageListener): void {
    if (type === 'message') this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: MessageListener): void {
    if (type === 'message') this.listeners.delete(listener);
  }

  postMessage(data: unknown): void {
    this.posted.push(data);
  }

  close(): void {
    this.closed = true;
  }

  emit(data: unknown): void {
    for (const listener of this.listeners) listener({ data } as MessageEvent<unknown>);
  }
}

const latestChannel = (): FakeBroadcastChannel => {
  const channel = FakeBroadcastChannel.instances.at(-1);
  if (!channel) throw new Error('BroadcastChannel не создан');
  return channel;
};

let unsubscribe: (() => void) | undefined;

beforeEach(() => {
  FakeBroadcastChannel.instances = [];
  useInstanceCredentialsStore.getState().resetCredentials();
  void useInstanceCredentialsStore.persist.clearStorage();
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
});

afterEach(() => {
  unsubscribe?.();
  unsubscribe = undefined;
});

describe('initInstanceCredentialsSync', () => {
  it('возвращает пустую функцию отписки без BroadcastChannel', () => {
    vi.stubGlobal('BroadcastChannel', undefined);

    unsubscribe = initInstanceCredentialsSync();

    expect(() => unsubscribe?.()).not.toThrow();
    expect(FakeBroadcastChannel.instances).toHaveLength(0);
  });

  it('открывает канал с общим именем', () => {
    unsubscribe = initInstanceCredentialsSync();

    expect(latestChannel().name).toBe('max-instance-credentials');
  });

  it('рассылает учётные данные при входе', () => {
    unsubscribe = initInstanceCredentialsSync();

    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    expect(latestChannel().posted).toContainEqual({
      kind: 'credentials',
      credentials: { idInstance: '1', apiTokenInstance: 'token' },
    });
  });

  it('рассылает событие выхода при пустых учётных данных', () => {
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    unsubscribe = initInstanceCredentialsSync();

    useInstanceCredentialsStore.getState().resetCredentials();

    expect(latestChannel().posted).toContainEqual({ kind: 'logout' });
  });

  it('применяет учётные данные из другой вкладки без обратной рассылки', () => {
    unsubscribe = initInstanceCredentialsSync();
    const channel = latestChannel();

    channel.emit({ kind: 'credentials', credentials: { idInstance: '9', apiTokenInstance: 't' } });

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '9',
      apiTokenInstance: 't',
    });
    expect(channel.posted).toHaveLength(0);
  });

  it('обрабатывает выход из другой вкладки и чистит хранилище', () => {
    const onRemoteLogout = vi.fn();
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });
    unsubscribe = initInstanceCredentialsSync({ onRemoteLogout });

    latestChannel().emit({ kind: 'logout' });

    expect(useInstanceCredentialsStore.getState()).toMatchObject({
      idInstance: '',
      apiTokenInstance: '',
    });
    expect(document.cookie).not.toContain('max-instance-credentials=');
    expect(onRemoteLogout).toHaveBeenCalledOnce();
  });

  it('игнорирует сообщения неизвестного формата', () => {
    unsubscribe = initInstanceCredentialsSync();
    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '1', apiTokenInstance: 'token' });

    latestChannel().emit({ kind: 'unknown' });

    expect(useInstanceCredentialsStore.getState().idInstance).toBe('1');
  });

  it('отписывается и закрывает канал при вызове функции отписки', () => {
    unsubscribe = initInstanceCredentialsSync();
    const channel = latestChannel();

    unsubscribe();
    unsubscribe = undefined;

    useInstanceCredentialsStore
      .getState()
      .setCredentials({ idInstance: '2', apiTokenInstance: 'token' });

    expect(channel.closed).toBe(true);
    expect(channel.posted).toHaveLength(0);
  });
});

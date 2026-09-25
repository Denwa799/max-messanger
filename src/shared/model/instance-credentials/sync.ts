import { z } from 'zod';

import { instanceCredentialsSchema } from './schema';
import { useInstanceCredentialsStore } from './store';
import type { InstanceCredentials } from './store';

const CHANNEL_NAME = 'max-instance-credentials';

const syncMessageSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('credentials'),
    credentials: instanceCredentialsSchema,
  }),
  z.object({ kind: z.literal('logout') }),
]);

type SyncMessage = z.infer<typeof syncMessageSchema>;

/**
 * Флаг, пока применяем данные из другой вкладки. Не даёт рассылать изменение обратно
 * и зацикливать синхронизацию.
 */
let isApplyingRemoteUpdate = false;

// Селектор для `subscribe` сравнивается по строке, поэтому храним учётные данные в виде
// подписи — так `subscribeWithSelector` отреагирует только на реальное изменение.
const toSignature = ({ idInstance, apiTokenInstance }: InstanceCredentials): string =>
  `${idInstance}\u0000${apiTokenInstance}`;

const toMessage = (signature: string): SyncMessage => {
  const [idInstance = '', apiTokenInstance = ''] = signature.split('\u0000');

  return idInstance || apiTokenInstance
    ? { kind: 'credentials', credentials: { idInstance, apiTokenInstance } }
    : { kind: 'logout' };
};

const applyRemoteMessage = (message: SyncMessage): void => {
  isApplyingRemoteUpdate = true;
  try {
    if (message.kind === 'credentials') {
      useInstanceCredentialsStore.getState().setCredentials(message.credentials);
      return;
    }

    useInstanceCredentialsStore.getState().resetCredentials();
    void useInstanceCredentialsStore.persist.clearStorage();
  } finally {
    isApplyingRemoteUpdate = false;
  }
};

/**
 * Синхронизирует учётные данные между открытыми вкладками. Cookie общие для браузера,
 * поэтому новая вкладка прочитает их сама, а уже открытые обновляем через
 * `BroadcastChannel`: вход и выход в одной вкладке сразу применяются в остальных.
 *
 * Возвращает функцию отписки — вызывайте её при размонтировании.
 */
export const initInstanceCredentialsSync = (): (() => void) => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return () => {};
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);

  const unsubscribe = useInstanceCredentialsStore.subscribe(
    (state) => toSignature(state),
    (signature) => {
      if (isApplyingRemoteUpdate) return;

      channel.postMessage(toMessage(signature));
    },
  );

  const handleMessage = (event: MessageEvent<unknown>) => {
    const parsed = syncMessageSchema.safeParse(event.data);
    if (!parsed.success) return;

    applyRemoteMessage(parsed.data);
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    unsubscribe();
    channel.removeEventListener('message', handleMessage);
    channel.close();
  };
};

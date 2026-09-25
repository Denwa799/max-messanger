import { useEffect, useRef } from 'react';

import { MaxApiError } from '../../client';
import { MaxService } from '../../services/max';
import type { ReceiveNotificationResponse } from '../../services/max/types';

export interface UseMaxReceiveNotificationsOptions {
  idInstance: string;
  apiTokenInstance: string;
  /** Таймаут ожидания уведомления в секундах, от 5 до 60. По умолчанию 5. */
  receiveTimeout?: number;
  /** Запускает и останавливает цикл получения уведомлений. По умолчанию `true`. */
  enabled?: boolean;
  /**
   * Обработчик входящего уведомления. Уведомление подтверждается (удаляется из очереди)
   * только после того, как обработчик успешно завершится, — при ошибке оно будет
   * получено повторно при следующем запросе.
   */
  onNotification: (notification: ReceiveNotificationResponse) => void | Promise<void>;
  /** Обработчик ошибок получения или подтверждения уведомления. */
  onError?: (error: MaxApiError) => void;
}

const RETRY_DELAY_MS = 1000;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Повторять имеет смысл только сетевые ошибки и 5xx. Ответы 4xx (неверные
 * `idInstance`/`apiTokenInstance`, заданный `webhookUrl`) сами не «пройдут», поэтому на
 * них цикл останавливается, иначе запросы уходили бы в API бесконечно.
 */
const isRetryable = (error: MaxApiError): boolean =>
  error.status === undefined || error.status >= 500;

/**
 * Запускает цикл получения входящих уведомлений: ReceiveNotification → обработка →
 * DeleteNotification. Уведомления приходят в порядке FIFO, а `receiveNotification`
 * удерживает запрос до `receiveTimeout` секунд, поэтому цикл работает как long-polling
 * без дополнительных интервалов опроса.
 *
 * Цикл останавливается на неретраибельной ошибке (см. `isRetryable`), при
 * `enabled = false` и при размонтировании — чтобы перезапустить, подключите хук заново
 * или переключите `enabled`.
 */
export const useMaxReceiveNotifications = ({
  idInstance,
  apiTokenInstance,
  receiveTimeout = 5,
  enabled = true,
  onNotification,
  onError,
}: UseMaxReceiveNotificationsOptions): void => {
  const onNotificationRef = useRef(onNotification);
  const onErrorRef = useRef(onError);

  // Обработчики могут меняться между рендерами, но не должны перезапускать цикл,
  // поэтому всегда вызываем актуальные через ref.
  useEffect(() => {
    onNotificationRef.current = onNotification;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const processQueue = async (): Promise<void> => {
      while (!cancelled) {
        try {
          const notification = await MaxService.receiveNotification({
            idInstance,
            apiTokenInstance,
            receiveTimeout,
          });

          if (cancelled) return;
          if (!notification) continue;

          await onNotificationRef.current(notification);
          if (cancelled) return;

          await MaxService.deleteNotification({
            idInstance,
            apiTokenInstance,
            receiptId: notification.receiptId,
          });
        } catch (error) {
          if (cancelled) return;

          const maxError = MaxApiError.from(error);
          onErrorRef.current?.(maxError);

          if (!isRetryable(maxError)) return;

          await delay(RETRY_DELAY_MS);
        }
      }
    };

    void processQueue();

    return () => {
      cancelled = true;
    };
  }, [idInstance, apiTokenInstance, receiveTimeout, enabled]);
};

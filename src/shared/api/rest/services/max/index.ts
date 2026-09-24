import { getError } from '@shared/lib';

import { MaxApiError, maxApiAxios } from '../../client';

import {
  DELETE_NOTIFICATION_ERROR_RULES,
  RECEIVE_NOTIFICATION_ERROR_RULES,
  SEND_MESSAGE_ERROR_RULES,
  resolveErrorMessage,
} from './errors';
import {
  deleteNotificationResponseSchema,
  receiveNotificationResponseSchema,
  sendMessageResponseSchema,
} from './schemas';
import type {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  MaxApiRequest,
  ReceiveNotificationRequest,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from './types';

class MaxApi {
  async sendMessage({
    idInstance,
    apiTokenInstance,
    message,
    chatId,
    typingTime,
    quotedMessageId,
  }: MaxApiRequest): Promise<SendMessageResponse> {
    try {
      const { data } = await maxApiAxios.post(
        `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        { chatId, message, typingTime, quotedMessageId },
      );

      return sendMessageResponseSchema.parse(data);
    } catch (error) {
      const maxError = MaxApiError.from(error);
      maxError.userMessage = resolveErrorMessage(SEND_MESSAGE_ERROR_RULES, maxError);
      getError({ error: maxError });
      throw maxError;
    }
  }

  async receiveNotification({
    idInstance,
    apiTokenInstance,
    receiveTimeout = 5,
  }: ReceiveNotificationRequest): Promise<ReceiveNotificationResponse | null> {
    try {
      const { data } = await maxApiAxios.get(
        `/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
        {
          params: { receiveTimeout },
          // Сервер держит запрос до receiveTimeout секунд, поэтому берём запас,
          // чтобы клиентский таймаут не срабатывал раньше ответа.
          timeout: (receiveTimeout + 5) * 1000,
        },
      );

      // При достижении таймаута ожидания метод возвращает пустой ответ.
      if (data === '' || data === null || data === undefined) return null;

      return receiveNotificationResponseSchema.parse(data);
    } catch (error) {
      const maxError = MaxApiError.from(error);
      maxError.userMessage = resolveErrorMessage(RECEIVE_NOTIFICATION_ERROR_RULES, maxError);
      getError({ error: maxError });
      throw maxError;
    }
  }

  async deleteNotification({
    idInstance,
    apiTokenInstance,
    receiptId,
  }: DeleteNotificationRequest): Promise<DeleteNotificationResponse> {
    try {
      const { data } = await maxApiAxios.delete(
        `/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
      );

      return deleteNotificationResponseSchema.parse(data);
    } catch (error) {
      const maxError = MaxApiError.from(error);
      maxError.userMessage = resolveErrorMessage(DELETE_NOTIFICATION_ERROR_RULES, maxError);
      getError({ error: maxError });
      throw maxError;
    }
  }
}

export const MaxService = new MaxApi();

import { logError } from '@shared/lib';

import { MaxApiError, maxApiAxios } from '../../client';

import {
  DELETE_NOTIFICATION_ERROR_RULES,
  GET_CHATS_ERROR_RULES,
  RECEIVE_NOTIFICATION_ERROR_RULES,
  SEND_MESSAGE_ERROR_RULES,
  resolveErrorMessage,
} from './errors';
import type { MaxErrorRule } from './errors';
import {
  deleteNotificationResponseSchema,
  getChatsResponseSchema,
  receiveNotificationResponseSchema,
  sendMessageResponseSchema,
} from './schemas';
import type {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  GetChatsRequest,
  GetChatsResponse,
  ReceiveNotificationRequest,
  ReceiveNotificationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './types';

/**
 * Единая точка обработки ошибок MAX API: приводит ошибку к `MaxApiError`, подбирает
 * пользовательское сообщение по правилам и логирует. Логика одинакова для всех методов
 * сервиса, поэтому вынесена из каждого запроса в один хелпер.
 */
const withErrorHandling = async <T>(
  rules: MaxErrorRule[],
  request: () => Promise<T>,
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    const apiError = MaxApiError.from(error);
    const maxError = apiError.withUserMessage(resolveErrorMessage(rules, apiError));
    logError(maxError);
    throw maxError;
  }
};

class MaxApi {
  async getChats({ idInstance, apiTokenInstance }: GetChatsRequest): Promise<GetChatsResponse> {
    return withErrorHandling(GET_CHATS_ERROR_RULES, async () => {
      const { data } = await maxApiAxios.get(
        `/waInstance${idInstance}/getChats/${apiTokenInstance}`,
      );

      return getChatsResponseSchema.parse(data);
    });
  }

  async sendMessage({
    idInstance,
    apiTokenInstance,
    message,
    chatId,
    typingTime,
    quotedMessageId,
  }: SendMessageRequest): Promise<SendMessageResponse> {
    return withErrorHandling(SEND_MESSAGE_ERROR_RULES, async () => {
      const { data } = await maxApiAxios.post(
        `/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        { chatId, message, typingTime, quotedMessageId },
      );

      return sendMessageResponseSchema.parse(data);
    });
  }

  async receiveNotification({
    idInstance,
    apiTokenInstance,
    receiveTimeout = 5,
  }: ReceiveNotificationRequest): Promise<ReceiveNotificationResponse | null> {
    return withErrorHandling(RECEIVE_NOTIFICATION_ERROR_RULES, async () => {
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
    });
  }

  async deleteNotification({
    idInstance,
    apiTokenInstance,
    receiptId,
  }: DeleteNotificationRequest): Promise<DeleteNotificationResponse> {
    return withErrorHandling(DELETE_NOTIFICATION_ERROR_RULES, async () => {
      const { data } = await maxApiAxios.delete(
        `/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
      );

      return deleteNotificationResponseSchema.parse(data);
    });
  }
}

export const MaxService = new MaxApi();

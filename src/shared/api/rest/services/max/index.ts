import { getError } from '@shared/lib';
import { MaxApiError, maxApiAxios } from '../../client';
import { SEND_MESSAGE_ERROR_RULES, resolveErrorMessage } from './errors';
import { sendMessageResponseSchema } from './schemas';
import type { MaxApiRequest, SendMessageResponse } from './types';

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
}

export const MaxService = new MaxApi();

import { MaxService } from '../../services/max';
import type { SendMessageRequest, SendMessageResponse } from '../../services/max/types';

import { createMaxMutation } from './create-max-mutation';

export const MAX_SEND_MESSAGE_MUTATION_KEY = ['max', 'sendMessage'] as const;

const sendMessageMutation = createMaxMutation<SendMessageResponse, SendMessageRequest>(
  MAX_SEND_MESSAGE_MUTATION_KEY,
  (payload) => MaxService.sendMessage(payload),
);

export const maxSendMessageMutationOptions = sendMessageMutation.mutationOptions;

export const useMaxSendMessage = sendMessageMutation.useMutation;

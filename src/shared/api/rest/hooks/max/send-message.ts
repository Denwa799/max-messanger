import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { SendMessageResponse, SendMessageVariables } from '../../services/max/types';

import { createMaxMutation } from './create-max-mutation';

export const MAX_SEND_MESSAGE_MUTATION_KEY = ['max', 'sendMessage'] as const;

const sendMessageMutation = createMaxMutation<SendMessageResponse, SendMessageVariables>(
  MAX_SEND_MESSAGE_MUTATION_KEY,
  (variables) => MaxService.sendMessage({ ...getInstanceCredentials(), ...variables }),
);

export const maxSendMessageMutationOptions = sendMessageMutation.mutationOptions;

export const useMaxSendMessage = sendMessageMutation.useMutation;

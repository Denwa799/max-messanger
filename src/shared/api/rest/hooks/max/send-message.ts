import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { UseMutationOptions } from '@tanstack/react-query';
import type { MaxApiRequest, SendMessageResponse } from '../../services/max/types';
import type { MaxApiError } from '../../client';
import { MaxService } from '../../services/max';

export const MAX_SEND_MESSAGE_MUTATION_KEY = ['max', 'sendMessage'] as const;

export const maxSendMessageMutationOptions = () =>
  mutationOptions<SendMessageResponse, MaxApiError, MaxApiRequest>({
    mutationKey: MAX_SEND_MESSAGE_MUTATION_KEY,
    mutationFn: (payload) => MaxService.sendMessage(payload),
  });

type SendMessageMutationOptions = Omit<
  UseMutationOptions<SendMessageResponse, MaxApiError, MaxApiRequest>,
  'mutationFn' | 'mutationKey'
>;

export const useMaxSendMessage = (options?: SendMessageMutationOptions) =>
  useMutation({ ...maxSendMessageMutationOptions(), ...options });

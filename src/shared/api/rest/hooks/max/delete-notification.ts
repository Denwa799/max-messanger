import { mutationOptions, useMutation } from '@tanstack/react-query';

import type { UseMutationOptions } from '@tanstack/react-query';
import type {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
} from '../../services/max/types';
import type { MaxApiError } from '../../client';
import { MaxService } from '../../services/max';

export const MAX_DELETE_NOTIFICATION_MUTATION_KEY = ['max', 'deleteNotification'] as const;

export const maxDeleteNotificationMutationOptions = () =>
  mutationOptions<DeleteNotificationResponse, MaxApiError, DeleteNotificationRequest>({
    mutationKey: MAX_DELETE_NOTIFICATION_MUTATION_KEY,
    mutationFn: (payload) => MaxService.deleteNotification(payload),
  });

type DeleteNotificationMutationOptions = Omit<
  UseMutationOptions<DeleteNotificationResponse, MaxApiError, DeleteNotificationRequest>,
  'mutationFn' | 'mutationKey'
>;

export const useMaxDeleteNotification = (options?: DeleteNotificationMutationOptions) =>
  useMutation({ ...maxDeleteNotificationMutationOptions(), ...options });

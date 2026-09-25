import { MaxService } from '../../services/max';
import type {
  DeleteNotificationRequest,
  DeleteNotificationResponse,
} from '../../services/max/types';

import { createMaxMutation } from './create-max-mutation';

export const MAX_DELETE_NOTIFICATION_MUTATION_KEY = ['max', 'deleteNotification'] as const;

const deleteNotificationMutation = createMaxMutation<
  DeleteNotificationResponse,
  DeleteNotificationRequest
>(MAX_DELETE_NOTIFICATION_MUTATION_KEY, (payload) => MaxService.deleteNotification(payload));

export const maxDeleteNotificationMutationOptions = deleteNotificationMutation.mutationOptions;

export const useMaxDeleteNotification = deleteNotificationMutation.useMutation;

import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type {
  DeleteNotificationResponse,
  DeleteNotificationVariables,
} from '../../services/max/types';

import { createMaxMutation } from './create-max-mutation';

export const MAX_DELETE_NOTIFICATION_MUTATION_KEY = ['max', 'deleteNotification'] as const;

const deleteNotificationMutation = createMaxMutation<
  DeleteNotificationResponse,
  DeleteNotificationVariables
>(MAX_DELETE_NOTIFICATION_MUTATION_KEY, (variables) =>
  MaxService.deleteNotification({ ...getInstanceCredentials(), ...variables }),
);

export const maxDeleteNotificationMutationOptions = deleteNotificationMutation.mutationOptions;

export const useMaxDeleteNotification = deleteNotificationMutation.useMutation;

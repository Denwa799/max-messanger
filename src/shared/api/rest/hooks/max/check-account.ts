import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { CheckAccountResponse, CheckAccountVariables } from '../../services/max/types';

import { createMaxMutation } from './create-max-mutation';

export const MAX_CHECK_ACCOUNT_MUTATION_KEY = ['max', 'checkAccount'] as const;

const checkAccountMutation = createMaxMutation<CheckAccountResponse, CheckAccountVariables>(
  MAX_CHECK_ACCOUNT_MUTATION_KEY,
  (variables) => MaxService.checkAccount({ ...getInstanceCredentials(), ...variables }),
);

export const maxCheckAccountMutationOptions = checkAccountMutation.mutationOptions;

export const useMaxCheckAccount = checkAccountMutation.useMutation;

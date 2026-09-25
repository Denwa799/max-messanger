import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { GetContactsResponse } from '../../services/max/types';

import { createMaxQuery } from './create-max-query';

export const MAX_GET_CONTACTS_QUERY_KEY = ['max', 'getContacts'] as const;

const getContactsQuery = createMaxQuery<GetContactsResponse>(MAX_GET_CONTACTS_QUERY_KEY, () =>
  MaxService.getContacts(getInstanceCredentials()),
);

export const maxGetContactsQueryOptions = getContactsQuery.queryOptions;

export const useMaxGetContacts = getContactsQuery.useQuery;

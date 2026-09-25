import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { GetContactsResponse } from '../../services/max/types';

import { createMaxQuery } from './create-max-query';
import { maxQueryKey } from './query-key';

export const maxGetContactsQueryKey = (idInstance: string) =>
  maxQueryKey(idInstance, 'getContacts');

const getContactsQuery = createMaxQuery<GetContactsResponse>(maxGetContactsQueryKey, () =>
  MaxService.getContacts(getInstanceCredentials()),
);

export const maxGetContactsQueryOptions = getContactsQuery.queryOptions;

export const useMaxGetContacts = getContactsQuery.useQuery;

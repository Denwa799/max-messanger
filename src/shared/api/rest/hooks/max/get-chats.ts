import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { GetChatsResponse } from '../../services/max/types';

import { createMaxQuery } from './create-max-query';
import { maxQueryKey } from './query-key';

export const maxGetChatsQueryKey = (idInstance: string) => maxQueryKey(idInstance, 'getChats');

const getChatsQuery = createMaxQuery<GetChatsResponse>(maxGetChatsQueryKey, () =>
  MaxService.getChats(getInstanceCredentials()),
);

export const maxGetChatsQueryOptions = getChatsQuery.queryOptions;

export const useMaxGetChats = getChatsQuery.useQuery;

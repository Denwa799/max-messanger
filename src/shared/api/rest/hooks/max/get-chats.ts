import { getInstanceCredentials } from '@shared/model';

import { MaxService } from '../../services/max';
import type { GetChatsResponse } from '../../services/max/types';

import { createMaxQuery } from './create-max-query';

export const MAX_GET_CHATS_QUERY_KEY = ['max', 'getChats'] as const;

const getChatsQuery = createMaxQuery<GetChatsResponse>(MAX_GET_CHATS_QUERY_KEY, () =>
  MaxService.getChats(getInstanceCredentials()),
);

export const maxGetChatsQueryOptions = getChatsQuery.queryOptions;

export const useMaxGetChats = getChatsQuery.useQuery;

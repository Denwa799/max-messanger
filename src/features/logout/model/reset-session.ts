import type { QueryClient } from '@tanstack/react-query';

import { resetChats } from '@entities/chat';
import { resetMessages } from '@entities/message';
import { clearInstanceCredentials } from '@shared/model';

export const resetSessionState = (queryClient: QueryClient): void => {
  clearInstanceCredentials();
  resetChats();
  resetMessages();
  queryClient.clear();
};

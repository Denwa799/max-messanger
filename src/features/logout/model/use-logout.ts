import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { resetSessionState } from './reset-session';

/** Действие «Выйти»: полностью очищает состояние сессии, включая кеш запросов. */
export const useLogout = (): (() => void) => {
  const queryClient = useQueryClient();
  return useCallback(() => resetSessionState(queryClient), [queryClient]);
};

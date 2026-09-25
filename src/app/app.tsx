import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { resetSessionState } from '@features/logout';
import { initInstanceCredentialsSync } from '@shared/model';

import { queryClient } from './query-client';
import { RootDocument } from './root-document';

export const App = ({ children }: { children: React.ReactNode }) => {
  // Выход в любой вкладке должен сбросить состояние и в остальных: чистим сторы и кеш.
  useEffect(
    () => initInstanceCredentialsSync({ onRemoteLogout: () => resetSessionState(queryClient) }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>{children}</RootDocument>
    </QueryClientProvider>
  );
};

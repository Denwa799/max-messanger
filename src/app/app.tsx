import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { initInstanceCredentialsSync } from '@shared/model';

import { queryClient } from './query-client';
import { RootDocument } from './root-document';

export const App = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => initInstanceCredentialsSync(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>{children}</RootDocument>
    </QueryClientProvider>
  );
};

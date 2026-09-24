import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@shared/api';

import { RootDocument } from './root-document';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>{children}</RootDocument>
    </QueryClientProvider>
  );
}

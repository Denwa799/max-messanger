import { HeadContent, Scripts } from '@tanstack/react-router';

import { AppDevtools } from './devtools';
import { MaxUIProvider } from './max-ui-provider';

export const RootDocument = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        <MaxUIProvider>{children}</MaxUIProvider>
        <AppDevtools />
        <Scripts />
      </body>
    </html>
  );
};

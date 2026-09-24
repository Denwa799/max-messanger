import { HeadContent, Scripts } from '@tanstack/react-router';

import { AppDevtools } from './devtools';

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <AppDevtools />
        <Scripts />
      </body>
    </html>
  );
}

import { createRootRouteWithContext } from '@tanstack/react-router';

import { App } from '@app/app';
import appCss from '@app/globals.css?url';

import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1',
      },
      {
        title: 'MAX Messenger',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: App,
});

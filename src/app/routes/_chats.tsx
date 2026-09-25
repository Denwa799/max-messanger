import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';

import { ChatsLayout } from '@app/layouts/chats-layout';

const ChatsRouteLayout = () => {
  const matches = useMatches();
  const activePane = matches.at(-1)?.staticData.activePane ?? 'chats';

  return (
    <ChatsLayout activePane={activePane}>
      <Outlet />
    </ChatsLayout>
  );
};

export const Route = createFileRoute('/_chats')({
  component: ChatsRouteLayout,
});

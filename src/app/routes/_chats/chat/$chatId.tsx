import { createFileRoute } from '@tanstack/react-router';

import { ChatPage } from '@pages/chat';

export const Route = createFileRoute('/_chats/chat/$chatId')({
  component: ChatRouteComponent,
  staticData: { activePane: 'content' },
});

function ChatRouteComponent() {
  const { chatId } = Route.useParams();

  return <ChatPage chatId={chatId} />;
}

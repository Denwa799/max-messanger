import { CellSimple } from '@maxhub/max-ui';

import { Skeleton } from '@shared/ui';

const SKELETON_ROWS = 10;

// Ключи фиксированные, чтобы разметка скелетона совпадала на сервере и клиенте.
const SKELETON_KEYS = Array.from({ length: SKELETON_ROWS }, (_, index) => `chat-skeleton-${index}`);

const ChatListItemSkeleton = ({ separator }: { separator: boolean }) => (
  <CellSimple
    separator={separator}
    before={<Skeleton className="size-13 rounded-full" />}
    title={<Skeleton className="h-4 w-1/2" />}
    subtitle={<Skeleton className="h-3 w-1/3" />}
    innerClassNames={{ after: 'self-start pt-0.75' }}
    after={<Skeleton className="h-3 w-8" />}
  />
);

export const ChatListSkeleton = () => (
  <div aria-hidden="true" className="min-h-0 flex-1 overflow-hidden">
    {SKELETON_KEYS.map((key, index) => (
      <ChatListItemSkeleton key={key} separator={index > 0} />
    ))}
  </div>
);

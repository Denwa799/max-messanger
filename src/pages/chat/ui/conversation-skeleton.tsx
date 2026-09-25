import { Flex } from '@maxhub/max-ui';

import { cn } from '@shared/lib';
import { Skeleton } from '@shared/ui';

interface BubbleStub {
  key: string;
  widthClass: string;
  outgoing: boolean;
}

const BUBBLES: BubbleStub[] = [
  { key: 'bubble-0', widthClass: 'w-2/5', outgoing: false },
  { key: 'bubble-1', widthClass: 'w-3/5', outgoing: true },
  { key: 'bubble-2', widthClass: 'w-1/2', outgoing: false },
  { key: 'bubble-3', widthClass: 'w-1/3', outgoing: true },
  { key: 'bubble-4', widthClass: 'w-2/3', outgoing: false },
];

export const ConversationSkeleton = () => (
  <div aria-hidden="true" className="flex h-full flex-col">
    <Flex align="center" gap={12} className="border-b border-divider-secondary px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Flex>

    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-4">
      {BUBBLES.map(({ key, widthClass, outgoing }) => (
        <Skeleton
          key={key}
          className={cn('h-10 rounded-2xl', widthClass, outgoing ? 'self-end' : 'self-start')}
        />
      ))}
    </div>

    <div className="border-t border-divider-secondary p-3">
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

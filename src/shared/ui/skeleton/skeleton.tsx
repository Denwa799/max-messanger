import { cn } from '@shared/lib';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={cn('animate-pulse rounded-md bg-background-tertiary', className)}
  />
);

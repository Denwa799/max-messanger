import type { CSSProperties } from 'react';

import { cn } from '@shared/lib';

const PATTERN_URL = '/pattern-space.svg';
const TILE_SIZE = 280;
const LINE_COLOR_CLASS = 'text-icon-muted';

type SpacePatternBackgroundProps = {
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export const SpacePatternBackground = ({
  color,
  size = TILE_SIZE,
  className,
  style,
}: SpacePatternBackgroundProps) => {
  const maskImage = `url(${PATTERN_URL})`;
  const maskSize = `${size}px ${size}px`;

  const maskStyle: CSSProperties = {
    maskImage,
    maskRepeat: 'repeat',
    maskSize,
    WebkitMaskImage: maskImage,
    WebkitMaskRepeat: 'repeat',
    WebkitMaskSize: maskSize,
  };

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none', LINE_COLOR_CLASS, className)}
      style={{
        ...(color ? { color } : undefined),
        backgroundColor: 'currentColor',
        ...maskStyle,
        ...style,
      }}
    />
  );
};

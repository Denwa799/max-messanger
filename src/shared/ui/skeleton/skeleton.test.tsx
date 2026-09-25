import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('скрыт от скринридеров и анимирован', () => {
    const { container } = render(<Skeleton />);

    const element = container.firstElementChild;
    expect(element).toHaveAttribute('aria-hidden', 'true');
    expect(element).toHaveClass('animate-pulse');
  });

  it('применяет переданные классы размеров', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);

    expect(container.firstElementChild).toHaveClass('h-4', 'w-10');
  });
});

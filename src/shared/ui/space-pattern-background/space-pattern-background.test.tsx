import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';

import { SpacePatternBackground } from './space-pattern-background';

const renderBackground = (props: ComponentProps<typeof SpacePatternBackground> = {}) =>
  render(<SpacePatternBackground {...props} />).container.firstElementChild as HTMLElement;

describe('SpacePatternBackground', () => {
  it('скрыт от скринридеров и не перехватывает клики', () => {
    const element = renderBackground();

    expect(element).toHaveAttribute('aria-hidden', 'true');
    expect(element).toHaveClass('pointer-events-none');
  });

  it('использует размер плитки по умолчанию', () => {
    const element = renderBackground();

    expect(element.style.maskSize).toBe('280px 280px');
    expect(element.style.maskImage).toContain('pattern-space.svg');
    expect(element.style.maskRepeat).toBe('repeat');
  });

  it('применяет переданный размер плитки', () => {
    const element = renderBackground({ size: 120 });

    expect(element.style.maskSize).toBe('120px 120px');
  });

  it('подставляет цвет через currentColor', () => {
    const element = renderBackground({ color: 'rgb(255, 0, 0)' });

    expect(element.style.color).toBe('rgb(255, 0, 0)');
    expect(element.style.backgroundColor.toLowerCase()).toBe('currentcolor');
  });

  it('объединяет переданные классы и стили', () => {
    const element = renderBackground({ className: 'custom', style: { opacity: '0.5' } });

    expect(element).toHaveClass('custom');
    expect(element.style.opacity).toBe('0.5');
  });
});

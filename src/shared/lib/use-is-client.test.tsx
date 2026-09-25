import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useIsClient } from './use-is-client';

describe('useIsClient', () => {
  it('становится true после монтирования в браузере', () => {
    const { result } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);
  });
});

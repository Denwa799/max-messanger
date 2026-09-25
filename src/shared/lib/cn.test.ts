import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('объединяет строки классов', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('пропускает ложные значения', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2');
  });

  it('поддерживает массивы и объекты как в clsx', () => {
    expect(cn(['flex', 'gap-2'], { 'text-sm': true, hidden: false })).toBe('flex gap-2 text-sm');
  });

  it('разрешает конфликт утилит Tailwind: побеждает последняя', () => {
    expect(cn('p-2 text-sm', 'p-4')).toBe('text-sm p-4');
  });
});

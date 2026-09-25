import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * Собирает className из любых ClassValue (строки, массивы, объекты, `false`/`null`)
 * и разрешает конфликты Tailwind-утилит: побеждает та, что идёт последней.
 *
 * Пример: `cn('p-2 text-sm', isActive && 'p-4')` → `'text-sm p-4'`.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Инициалы для аватара: первые буквы первых двух слов имени. */
export const getInitials = (title: string): string =>
  title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

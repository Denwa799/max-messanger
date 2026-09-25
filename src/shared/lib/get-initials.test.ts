import { describe, expect, it } from 'vitest';

import { getInitials } from './get-initials';

describe('getInitials', () => {
  it('берёт первые буквы первых двух слов', () => {
    expect(getInitials('Иван Петров')).toBe('ИП');
  });

  it('переводит буквы в верхний регистр', () => {
    expect(getInitials('иван петров')).toBe('ИП');
  });

  it('игнорирует слова после второго', () => {
    expect(getInitials('Иван Петров Сидоров')).toBe('ИП');
  });

  it('возвращает одну букву для однословного имени', () => {
    expect(getInitials('Мария')).toBe('М');
  });

  it('не считает лишние пробелы и переносы строк за слова', () => {
    expect(getInitials('  Иван \n  Петров  ')).toBe('ИП');
  });

  it('возвращает пустую строку для пустого ввода', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });
});

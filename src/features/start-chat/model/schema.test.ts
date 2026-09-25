import { describe, expect, it } from 'vitest';

import { startChatSchema } from './schema';

const firstError = (phoneNumber: string): string | undefined => {
  const result = startChatSchema.safeParse({ phoneNumber });
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe('startChatSchema', () => {
  it('принимает российский номер', () => {
    expect(startChatSchema.parse({ phoneNumber: '79991234567' })).toEqual({
      phoneNumber: '79991234567',
    });
  });

  it('оставляет только цифры, отбрасывая форматирование', () => {
    expect(startChatSchema.parse({ phoneNumber: '+7 (999) 123-45-67' })).toEqual({
      phoneNumber: '79991234567',
    });
  });

  it('принимает белорусский номер', () => {
    expect(startChatSchema.parse({ phoneNumber: '375291234567' })).toEqual({
      phoneNumber: '375291234567',
    });
  });

  it('обрезает крайние пробелы', () => {
    expect(startChatSchema.parse({ phoneNumber: '  79991234567  ' })).toEqual({
      phoneNumber: '79991234567',
    });
  });

  it('принимает номер минимальной длины (11 цифр)', () => {
    expect(startChatSchema.safeParse({ phoneNumber: '79991234567' }).success).toBe(true);
  });

  it('принимает номер максимальной длины (15 цифр)', () => {
    expect(startChatSchema.safeParse({ phoneNumber: '799912345678901' }).success).toBe(true);
  });

  it('отклоняет слишком короткий номер', () => {
    expect(firstError('7999123456')).toBe('Введите номер в формате 79991234567');
  });

  it('отклоняет слишком длинный номер', () => {
    expect(firstError('7999123456789012')).toBe('Введите номер в формате 79991234567');
  });

  it('отклоняет номер, начинающийся с нуля', () => {
    expect(firstError('07991234567')).toBe(
      'Номер не должен начинаться с 0 — укажите код страны, например 7',
    );
  });

  it('отклоняет ввод без цифр', () => {
    expect(firstError('нет цифр')).toBe('Введите номер в формате 79991234567');
  });
});

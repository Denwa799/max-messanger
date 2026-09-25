import { describe, expect, it } from 'vitest';

import { instanceSetupSchema } from './schema';

const firstError = (input: unknown): string | undefined => {
  const result = instanceSetupSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe('instanceSetupSchema', () => {
  it('принимает корректные учётные данные', () => {
    const result = instanceSetupSchema.safeParse({
      idInstance: '1101000000',
      apiTokenInstance: 'token-abc',
    });

    expect(result.success).toBe(true);
  });

  it('обрезает крайние пробелы', () => {
    const result = instanceSetupSchema.parse({
      idInstance: '  1101000000  ',
      apiTokenInstance: '  token  ',
    });

    expect(result).toEqual({ idInstance: '1101000000', apiTokenInstance: 'token' });
  });

  it('отклоняет пустой idInstance', () => {
    expect(firstError({ idInstance: '', apiTokenInstance: 'token' })).toBe('Укажите idInstance');
  });

  it('отклоняет нечисловой idInstance', () => {
    expect(firstError({ idInstance: 'abc', apiTokenInstance: 'token' })).toBe(
      'idInstance должен быть целым числом',
    );
  });

  it('отклоняет пустой apiTokenInstance', () => {
    expect(firstError({ idInstance: '123', apiTokenInstance: '   ' })).toBe(
      'Укажите apiTokenInstance',
    );
  });
});

import { describe, expect, it } from 'vitest';

import { instanceCredentialsSchema } from './schema';

describe('instanceCredentialsSchema', () => {
  it('принимает пару idInstance и apiTokenInstance', () => {
    const result = instanceCredentialsSchema.safeParse({
      idInstance: '1101000000',
      apiTokenInstance: 'token',
    });

    expect(result.success).toBe(true);
  });

  it('требует оба поля', () => {
    expect(instanceCredentialsSchema.safeParse({ idInstance: '1' }).success).toBe(false);
    expect(instanceCredentialsSchema.safeParse({ apiTokenInstance: 'token' }).success).toBe(false);
  });

  it('отклоняет нестроковые значения', () => {
    expect(
      instanceCredentialsSchema.safeParse({ idInstance: 1101000000, apiTokenInstance: 'token' })
        .success,
    ).toBe(false);
  });

  it('отбрасывает лишние поля', () => {
    const result = instanceCredentialsSchema.parse({
      idInstance: '1',
      apiTokenInstance: 'token',
      extra: 'лишнее',
    });

    expect(result).toEqual({ idInstance: '1', apiTokenInstance: 'token' });
  });
});

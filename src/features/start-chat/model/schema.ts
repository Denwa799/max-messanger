import { z } from 'zod';

/**
 * Номер вводим в свободной форме, а в API отправляем только цифры. MAX поддерживает
 * российские (код 7) и белорусские (код 375) номера.
 */
export const startChatSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length >= 11 && value.length <= 15, {
      message: 'Введите номер в формате 79991234567',
    })
    // Международный номер не начинается с 0: ведущий ноль потерялся бы при приведении
    // к числу (`Number('0799…')` → `799…`) и запрос ушёл бы с неверным номером.
    .refine((value) => !value.startsWith('0'), {
      message: 'Номер не должен начинаться с 0 — укажите код страны, например 7',
    }),
});

export type StartChatFormValues = z.infer<typeof startChatSchema>;

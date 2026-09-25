import { z } from 'zod';

export const instanceSetupSchema = z.object({
  idInstance: z
    .string()
    .trim()
    .min(1, 'Укажите idInstance')
    .regex(/^\d+$/, 'idInstance должен быть целым числом'),
  apiTokenInstance: z.string().trim().min(1, 'Укажите apiTokenInstance'),
});

export type InstanceSetupFormValues = z.infer<typeof instanceSetupSchema>;

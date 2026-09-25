import { z } from 'zod';

export const instanceCredentialsSchema = z.object({
  idInstance: z.string(),
  apiTokenInstance: z.string(),
});

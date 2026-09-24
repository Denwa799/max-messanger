import { z } from 'zod';

export const ENV_CONFIG = z
  .object({
    VITE_GREEN_API_MAX_URL: z.url(),
  })
  .parse({
    VITE_GREEN_API_MAX_URL: import.meta.env.VITE_GREEN_API_MAX_URL,
  });

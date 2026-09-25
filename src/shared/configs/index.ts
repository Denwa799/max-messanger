import { z } from 'zod';

const envSchema = z.object({
  VITE_GREEN_API_MAX_URL: z.url(),
});

const envResult = envSchema.safeParse({
  VITE_GREEN_API_MAX_URL: import.meta.env.VITE_GREEN_API_MAX_URL,
});

if (!envResult.success) {
  throw new Error(
    'Не задан или некорректен VITE_GREEN_API_MAX_URL. Скопируйте .env.example в .env и укажите URL MAX API.',
  );
}

export const ENV_CONFIG = envResult.data;

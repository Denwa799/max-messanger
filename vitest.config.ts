import { defineConfig } from 'vitest/config';
import viteReact from '@vitejs/plugin-react';

/**
 * Отдельная конфигурация для тестов: не поднимаем плагины TanStack Start и Tailwind —
 * тестам нужен только React и алиасы путей из `tsconfig.json`. Пути разрешает встроенная
 * поддержка `resolve.tsconfigPaths` из Vite 8, поэтому дублировать `paths` не нужно.
 */
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/app/testing/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // `ENV_CONFIG` бросает при отсутствии URL, а тесты импортируют `@shared/configs`
    // транзитивно (например, через `@shared/api`), поэтому переменная нужна всегда.
    env: {
      VITE_GREEN_API_MAX_URL: 'https://3100.api.green-api.com',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/app/testing/**',
        'src/app/routeTree.gen.ts',
        'src/**/index.ts',
        'src/**/types.ts',
      ],
    },
  },
});

import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// Проектные сайты GitHub Pages отдаются из подпути (/<repo>/), поэтому база
// ассетов должна совпадать с ним. Локальная разработка и деплой в корень оставляют '/'.
const base = process.env.VITE_BASE_PATH ?? '/';

const config = defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-tanstack';
          }
          if (id.includes('node_modules/@maxhub/')) {
            return 'vendor-max-ui';
          }

          return undefined;
        },
      },
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      spa: { enabled: true, prerender: { outputPath: '/index' } },
      router: {
        entry: 'app/router',
        routesDirectory: 'app/routes',
        generatedRouteTree: 'app/routeTree.gen.ts',
      },
    }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;

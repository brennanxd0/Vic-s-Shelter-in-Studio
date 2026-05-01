import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
        watch: {
          usePolling: true,
          interval: 1000,
        },
      },
      plugins: [
        react(), 
        tailwindcss(),
        {
          name: 'disable-vite-client',
          enforce: 'pre',
          resolveId(id) {
            if (id === '/@vite/client' || id.includes('@vite/client')) return '\0vite-client-mock';
          },
          load(id) {
            if (id === '\0vite-client-mock') return 'export const injectQuery = () => {}; export const createHotContext = () => ({ accept: () => {}, dispose: () => {}, prune: () => {}, invalidate: () => {}, data: {} }); export default {};';
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.hot': 'undefined',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

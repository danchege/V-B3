import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: isProduction ? '/' : '/',
    publicDir: 'public',
    build: {
      outDir: resolve(__dirname, 'dist'),
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isProduction ? false : true,
      manifest: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('emoji-picker-react')) {
                return 'vendor-emoji';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      strictPort: true
    },
    preview: {
      port: 3000,
      open: true,
      strictPort: true
    }
  };
});

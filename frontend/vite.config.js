// @ts-check
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('vite').UserConfigExport} */
export default defineConfig(({ mode, command }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: '/', // Always use root path for Vercel deployments
    publicDir: 'public',
    define: {
      'process.env': process.env, // Pass through environment variables
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
      // Enable DOM testing
      environmentOptions: {
        jsdom: {
          url: 'http://localhost:3000',
        },
      },
      // Enable coverage reporting
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isProduction ? 'hidden' : true,
      minify: isProduction ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
      reportCompressedSize: false, // Disable gzip size reporting for slightly faster build
      cssCodeSplit: true, // Enable CSS code splitting
      target: 'esnext', // Target modern browsers
      commonjsOptions: {
        include: /node_modules/,
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: (id) => {
            // Split node_modules into separate chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('@chakra-ui')) {
                return 'vendor-chakra';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer';
              }
              return 'vendor';
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1]?.toLowerCase() || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (/css/i.test(ext)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      css: {
        devSourcemap: true,
        modules: {
          localsConvention: 'camelCaseOnly',
        },
      },
    },
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      open: false,
      cors: true
    },
    preview: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@context': resolve(__dirname, 'src/context'),
      },
    },
  };
});

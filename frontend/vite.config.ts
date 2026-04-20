import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true, // Required for hot reload inside Docker on Linux
    },
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },

  // @react-pdf/renderer uses workers and must be excluded from pre-bundling
  optimizeDeps: {
    exclude: ['@react-pdf/renderer'],
  },

  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages':      path.resolve(__dirname, 'src/pages'),
      '@services':   path.resolve(__dirname, 'src/services'),
      '@hooks':      path.resolve(__dirname, 'src/hooks'),
      '@types':      path.resolve(__dirname, 'src/types'),
      '@assets':     path.resolve(__dirname, 'src/assets'),
    },
  },
});

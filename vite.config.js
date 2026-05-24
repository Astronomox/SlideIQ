import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  server: {
    port: 5173,
    historyApiFallback: {
      rewrites: [
        { from: /^\/landing\.html$/, to: '/landing.html' },
        { from: /./, to: '/index.html' },
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer': ['framer-motion'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'pdfjs': ['pdfjs-dist'],
        },
      },
    },
  },
});

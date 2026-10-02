import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    port: 5173,
    proxy: {
      // Backend stub. Jika server/index.mjs tidak berjalan, frontend akan
      // menerima error dan menampilkan status jujur "layanan tidak tersedia".
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Satu chunk JS agar bundler offline single-file lebih sederhana.
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
});

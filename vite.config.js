import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@phosphor-icons/vue')) return 'vendor-icons';
          if (id.includes('/xlsx/') || id.includes('/mammoth/')) return 'vendor-heavy';
          if (
            id.includes('/vue/') ||
            id.includes('/vue-router/') ||
            id.includes('/vuex/') ||
            id.includes('@tanstack/vue-query')
          ) return 'vendor-core';
          return undefined;
        },
      },
    },
  }
});

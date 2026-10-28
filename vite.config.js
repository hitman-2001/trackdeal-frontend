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
        manualChunks: {
          'vendor-core': ['vue', 'vue-router', 'vuex', '@tanstack/vue-query'],
          'vendor-icons': ['@phosphor-icons/vue'],
          'vendor-heavy': ['xlsx', 'mammoth', 'jimp'],
        },
      },
    },
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'publi', // Servir arquivos da pasta publi
  server: {
    port: 5174,
    host: '0.0.0.0',
    proxy: {
      // Em dev, encaminha as chamadas /api para o backend Express
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 9001}`,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react'], // Incluir lucide-react no bundle
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react'], // Separar ícones em chunk próprio
        },
      },
    },
  },
});

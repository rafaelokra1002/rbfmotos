import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'publi', // Servir arquivos da pasta publi
  server: {
    port: 5174,
    host: '0.0.0.0',
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

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
        allowedHosts: ['angels.byapex.dev'],    
},
  server: {
    proxy: {
      // Proxy API requests during development to avoid CORS issues.
      // Frontend should use `/api` as the base URL (see .env for VITE_API_BASE_URL).
      '/api': {
        target: 'https://api-angels.byapex.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

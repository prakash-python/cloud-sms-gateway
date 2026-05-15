import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.1.37:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://192.168.1.37:8000',
        ws: true,
      },
    },
  },
})

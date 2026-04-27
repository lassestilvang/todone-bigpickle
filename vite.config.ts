import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Only split vendor to avoid circular chunks
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 400,
    cssCodeSplit: true
  }
})
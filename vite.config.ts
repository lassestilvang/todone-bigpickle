import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          utils: ['date-fns'],
          database: ['dexie'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          hotkeys: ['react-hotkeys-hook']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true
  }
})

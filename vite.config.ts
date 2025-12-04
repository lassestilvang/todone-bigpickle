import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          if (id.includes('lucide-react')) {
            return 'ui';
          }
          if (id.includes('date-fns')) {
            return 'utils';
          }
          if (id.includes('dexie')) {
            return 'database';
          }
          if (id.includes('@dnd-kit')) {
            return 'dnd';
          }
          if (id.includes('react-hotkeys-hook')) {
            return 'hotkeys';
          }
          
          // Feature chunks - only create if actually used
          if (id.includes('recurringTasks')) {
            return 'recurring';
          }
          if (id.includes('karmaService')) {
            return 'karma';
          }
          if (id.includes('collaborationService')) {
            return 'collaboration';
          }
          if (id.includes('naturalLanguageParser')) {
            return 'nlp';
          }
          if (id.includes('notificationService')) {
            return 'notifications';
          }
          
          // Large components
          if (id.includes('TaskDetail')) {
            return 'task-detail';
          }
          if (id.includes('BoardView')) {
            return 'board-view';
          }
          if (id.includes('CommandPalette')) {
            return 'command-palette';
          }
        }
      }
    },
    chunkSizeWarningLimit: 400, // Stricter limit for better performance
    cssCodeSplit: true
  }
})

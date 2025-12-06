# AGENTS.md - Development Guidelines for Todone

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (tsc -b && vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build

## Code Style

### TypeScript & Types
- Strict TypeScript with full type safety
- Define interfaces in `src/types/index.ts`
- Use union types for enums: `type Priority = 'p1' | 'p2' | 'p3' | 'p4'`
- Always type React components: `React.FC<Props>`

### Imports
- React imports first: `import React from 'react'`
- Group: external libraries → internal modules → relative imports
- Use type-only imports: `import type { Task } from '../types'`

### Component Structure
- Functional components with hooks only
- Zustand for state management
- Feature folders: `src/components/{feature}/`
- Layout: `src/components/layout/`

### Naming
- PascalCase for components/interfaces
- camelCase for functions/variables
- kebab-case for files
- Descriptive names: `TaskItem`, `createTask`, `isCompleted`

### Error Handling
- try/catch for async operations
- Set error state in Zustand store
- User-friendly messages, no sensitive data exposure

### Styling
- Tailwind CSS classes only
- Mobile-first responsive design
- Consistent spacing/typography

### Database & State
- Dexie.js for IndexedDB
- Zustand with persistence middleware
- Optimistic updates, always update `updatedAt`
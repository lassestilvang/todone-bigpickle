# AGENTS.md - Development Guidelines for Todone

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Code Style Guidelines

### TypeScript & Types
- Use strict TypeScript with full type safety
- Define interfaces in `src/types/index.ts`
- Use union types for enums (Priority, ViewMode, etc.)
- Always type React components: `React.FC<Props>`

### Imports
- React imports first: `import React from 'react'`
- Group imports: external libraries, internal modules, relative imports
- Use type-only imports: `import type { User } from '../types'`

### Component Structure
- Functional components with hooks only
- Use Zustand for state management
- Components in feature folders: `src/components/{feature}/`
- Layout components in `src/components/layout/`

### Naming Conventions
- PascalCase for components and interfaces
- camelCase for functions and variables
- kebab-case for file names
- Use descriptive names: `TaskItem`, `createTask`, `isCompleted`

### Error Handling
- Use try/catch for async operations
- Set error state in Zustand store
- Show user-friendly error messages
- Never expose sensitive data in errors

### Styling
- Use Tailwind CSS classes only
- Follow design system colors: primary green, priority colors
- Responsive design with mobile-first approach
- Consistent spacing and typography

### Database & State
- Use Dexie.js for IndexedDB operations
- Zustand store with persistence middleware
- Optimistic updates for better UX
- Always update `updatedAt` timestamps

### Testing
- No test framework currently configured
- Manual testing in development environment
- Test all CRUD operations before committing
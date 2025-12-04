# AGENTS.md - Development Guidelines for Todone

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Status: Phase 3 ✅ COMPLETED

All Phase 3 advanced features are fully implemented and tested:
- ✅ Sub-tasks & Dependencies with circular dependency prevention
- ✅ Drag-and-Drop using @dnd-kit library
- ✅ Advanced Search with multi-criteria filtering
- ✅ Custom Labels & Tags with usage statistics
- ✅ Task Comments with threaded discussions
- ✅ Time Tracking with session logging

The application now includes enterprise-grade features beyond Phase 3:
- Natural language processing for smart task creation
- Collaboration system with role-based permissions
- Karma/gamification system with productivity tracking
- Comprehensive keyboard shortcuts and command palette
- Mobile-responsive design with touch interactions

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

## Phase 3 Implementation Guidelines

### Advanced Features Architecture
- **Sub-tasks & Dependencies**: Use hierarchical task structure with circular dependency prevention
- **Drag-and-Drop**: Implement with @dnd-kit library for modern, accessible interactions
- **Advanced Search**: Multi-criteria filtering with real-time query system
- **Labels System**: Color-coded organization with usage statistics tracking
- **Task Comments**: Threaded discussions with timestamps and markdown support
- **Time Tracking**: Session-based logging with manual entry capabilities

### Performance Considerations
- Implement optimistic updates for better user experience
- Use React.memo for expensive component re-renders
- Leverage IndexedDB indexing for fast database queries
- Implement code splitting for large components (>500KB chunks)
- Use virtual scrolling for long task lists when needed

### Security & Data Integrity
- Validate all user inputs before database operations
- Implement proper error boundaries for graceful failures
- Use TypeScript strict mode for type safety
- Sanitize user-generated content (comments, descriptions)
- Implement proper data validation schemas

### Advanced UI Patterns
- Use React Portals for modals and overlays
- Implement proper focus management for accessibility
- Use CSS-in-JS sparingly; prefer Tailwind utilities
- Implement loading states and skeleton screens
- Use proper ARIA labels for screen readers

### State Management Best Practices
- Keep Zustand store actions pure and predictable
- Use middleware for persistence and logging
- Implement proper state normalization for complex data
- Use selectors to prevent unnecessary re-renders
- Implement proper error handling in async actions

### Code Organization
- Group related features in dedicated folders
- Use barrel exports for clean imports
- Implement proper separation of concerns
- Use custom hooks for reusable logic
- Keep components focused and single-purpose
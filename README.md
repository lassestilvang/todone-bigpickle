# Todone - Complete Task Management Application

A modern, feature-rich task management application inspired by Todoist, built with React, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- ✅ **Authentication** - Beautiful login interface with local auth
- ✅ **Task Management** - Complete CRUD operations with priorities, due dates, and descriptions
- ✅ **Multiple Views** - Inbox, Today, Upcoming, and Projects views
- ✅ **Project Organization** - Create and organize tasks into projects with color coding
- ✅ **Quick Add** - Fast task creation from anywhere
- ✅ **Command Palette** - Global search and navigation (Cmd/Ctrl+K)
- ✅ **Task Details** - Comprehensive task editing and management
- ✅ **Offline Support** - Full IndexedDB implementation for local storage
- ✅ **Advanced Scheduling** - Recurring tasks with flexible patterns
- ✅ **Smart Input** - Advanced natural language parsing with AI-powered suggestions
- ✅ **Gamification** - Karma system with points, levels, and achievements
- ✅ **Templates** - Pre-built task templates for productivity
- ✅ **Collaboration** - Share projects and work with teams

### User Experience
- 🎨 **Modern UI** - Clean, professional design with Tailwind CSS
- ⚡ **Fast Performance** - Optimized React components and state management
- 🎯 **Keyboard Shortcuts** - Productivity-focused keyboard navigation
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Theme Support** - Light and dark mode support
- 🔍 **Smart Search** - Global search across tasks and projects

### Technical Features
- 🔧 **TypeScript** - Full type safety throughout application
- 💾 **Offline-First** - IndexedDB with Dexie.js for local storage
- 🔄 **State Management** - Zustand with persistence and optimistic updates
- 🎨 **Component Architecture** - Reusable, well-structured components
- 🚀 **Modern Build** - Vite for fast development and production builds

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Database**: IndexedDB with Dexie.js
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todone-bigpickle
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Usage

### Getting Started
1. Open the app in your browser
2. Sign in with any email and password (demo mode)
3. Start creating and managing tasks!

### Key Features

#### Task Management
- **Create Tasks**: Use the floating + button or quick add bar
- **Set Priorities**: P1 (red), P2 (orange), P3 (blue), P4 (default)
- **Due Dates**: Set due dates with visual indicators
- **Task Details**: Click any task to view and edit details
- **Complete Tasks**: Click the checkbox to mark tasks complete

#### Project Organization
- **Create Projects**: Organize tasks into color-coded projects
- **Project Views**: Switch between list, board, and calendar views
- **Task Count**: See active task count per project

#### Navigation
- **Command Palette**: Press `Cmd/Ctrl+K` for quick navigation
- **Sidebar Navigation**: Easy access to all views
- **Keyboard Shortcuts**: Productivity-focused shortcuts

#### Views
- **Inbox**: Tasks without projects
- **Today**: Tasks due today (including overdue)
- **Upcoming**: Tasks for the next 7 days
- **Projects**: All projects and their tasks
- **Filters**: Create and apply custom filters to tasks
- **Labels**: Organize tasks with color-coded labels

#### Labels & Filters
- **Create Labels**: Add color-coded labels for task organization
- **Manage Labels**: Edit, delete, and organize labels
- **Custom Filters**: Create filters with complex queries
- **Filter Tasks**: Apply filters to quickly find specific tasks
- **Smart Sorting**: Sort by order, due date, or priority

#### Advanced Features
- **Recurring Tasks**: Set up daily, weekly, monthly, or yearly recurring patterns
- **Natural Language Input**: Create tasks with natural language like "Meeting tomorrow at 2pm p1 #work"
- **Smart Suggestions**: AI-powered task recommendations based on your patterns and habits
- **Auto-Prioritization**: Intelligent priority assignment based on deadlines and context
- **Workflow Automation**: Custom triggers and automated task management
- **Calendar Integration**: Two-way sync with Google Calendar and Outlook
- **Productivity Dashboard**: Track karma points, streaks, and productivity metrics
- **Task Templates**: Use pre-built templates for common workflows
- **Project Collaboration**: Share projects and invite team members with role-based permissions

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components
│   ├── tasks/         # Task-related components
│   ├── views/         # Main view components
│   └── ...           # Other UI components
├── lib/               # Utility libraries
│   └── database.ts   # IndexedDB configuration
├── store/             # State management
│   └── appStore.ts   # Zustand store
├── types/             # TypeScript type definitions
│   └── index.ts      # Core data types
└── ...
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Technologies
- **React Hooks** - Modern React patterns
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper
- **Vite** - Fast build tool

## 🎨 Design System

### Colors
- **Primary**: Green (#10b981) - Todone brand color
- **Priority P1**: Red (#ef4444)
- **Priority P2**: Orange (#f97316)
- **Priority P3**: Blue (#3b82f6)
- **Priority P4**: Gray (#6b7280)

### Components
- **Buttons**: Primary, secondary, ghost variants
- **Cards**: Consistent border radius and shadows
- **Forms**: Standardized input styles
- **Navigation**: Consistent sidebar and header patterns

## 🚀 Development Roadmap

The application is continuously evolving with a comprehensive roadmap focused on user experience and incremental value delivery:

### Phase 1: Foundation ✅ COMPLETED
- ✅ **Authentication** - Beautiful login interface with local auth
- ✅ **Task Management** - Complete CRUD operations with priorities, due dates, and descriptions
- ✅ **Multiple Views** - Inbox, Today, Upcoming, and Projects views
- ✅ **Project Organization** - Create and organize tasks into projects with color coding
- ✅ **Quick Add** - Fast task creation from anywhere
- ✅ **Command Palette** - Global search and navigation (Cmd/Ctrl+K)
- ✅ **Task Details** - Comprehensive task editing and management
- ✅ **Offline Support** - Full IndexedDB implementation for local storage

### Phase 2: Organization & Productivity ✅ COMPLETED
**Low-hanging fruits that significantly improve user experience:**
- ✅ **Mobile Responsive Design** - Ensure seamless experience across all devices
- ✅ **Keyboard Shortcuts Enhancement** - Comprehensive keyboard navigation for power users
- ✅ **Quick Filters** - One-click filters for "Today", "This Week", "Overdue", "Completed"
- ✅ **Bulk Actions** - Select multiple tasks for bulk operations (complete, delete, move)
- ✅ **Task Templates** - Pre-built templates for common workflows (daily standup, weekly review)
- ✅ **Smart Notifications** - Browser notifications for due tasks and reminders

**Phase 2 Implementation Summary:**
- 📱 **Mobile-First Design**: Fully responsive layout with collapsible sidebar, touch-friendly controls, and mobile-optimized task detail panels
- ⌨️ **Comprehensive Keyboard Shortcuts**: 30+ keyboard shortcuts including navigation (G+T for Today), task management (Q for quick add), bulk operations, and priority settings (Alt+1-4)
- 🔍 **Quick Filters**: One-click filtering for Today, This Week, Overdue, and Completed tasks with live counts
- ✅ **Bulk Actions**: Multi-select functionality with bulk complete, delete, archive, priority changes, project moves, and label management
- 📋 **Enhanced Templates**: 10+ pre-built templates including Morning Routine, Content Creation, Study Sessions, and Client Onboarding
- 🔔 **Smart Notifications**: Browser-based notifications for due tasks, overdue reminders, and achievement notifications with permission management

### Phase 3: Advanced Task Management ✅ COMPLETED
**Power features for heavy users:**
- ✅ **Sub-tasks & Dependencies** - Create nested tasks with parent-child relationships
- ✅ **Drag-and-Drop** - Reorder tasks and move between projects/views
- ✅ **Advanced Search** - Filter by priority, date ranges, labels, and custom queries
- ✅ **Custom Labels & Tags** - Color-coded labels for better organization
- ✅ **Task Comments** - Add notes and context to individual tasks
- ✅ **Time Tracking** - Simple time logging per task with daily summaries

**Phase 3 Implementation Summary:**
- 🏗️ **Sub-tasks & Dependencies**: Full hierarchical task management with parent-child relationships, dependency tracking, and circular dependency prevention
- 🎯 **Enhanced Drag-and-Drop**: Improved drag-and-drop functionality supporting task reordering, subtask creation, project/section assignment, and cross-project movement
- 🔍 **Advanced Search**: Comprehensive search interface with filters for text, date ranges, priorities, projects, labels, and task status
- 🏷️ **Enhanced Labels System**: Improved label management with search, sorting, usage statistics, and color-coded organization
- 💬 **Task Comments**: Full commenting system with timestamps and threaded discussions for individual tasks
- ⏱️ **Time Tracking**: Complete time tracking system with session logging, manual time entry, and daily summaries

### Phase 4: Automation & Intelligence ✅ COMPLETED
**Smart features that save time:**
- ✅ **Natural Language Input** - Create tasks like "Meeting tomorrow at 2pm p1 #work"
- ✅ **Recurring Tasks** - Daily, weekly, monthly, or yearly recurring patterns
- ✅ **Smart Suggestions** - AI-powered task suggestions based on patterns
- ✅ **Auto-prioritization** - Intelligent priority assignment based on deadlines
- ✅ **Workflow Automation** - Custom triggers and automated task management
- ✅ **Calendar Integration** - Two-way sync with Google Calendar and Outlook

**Phase 4 Implementation Summary:**
- 🧠 **Smart Suggestions Engine**: Advanced AI-powered suggestion system that learns from user patterns, task history, and contextual factors to provide intelligent task recommendations with confidence scoring
- ⚡ **Auto-Prioritization System**: Sophisticated priority management with rule-based engine, contextual factors, and intelligent priority assignment based on deadlines, workload, and task relationships
- 🔄 **Workflow Automation**: Comprehensive automation system with custom triggers (time-based, event-based, conditional), multi-action workflows, and execution tracking with conflict resolution
- 📅 **Calendar Integration**: Full two-way sync with Google Calendar and Outlook, iCalendar export/import, recurring event support, and bidirectional task-calendar synchronization
- 🎯 **Natural Language Processing**: Enhanced NLP engine with improved pattern recognition, contextual understanding, and smart task creation from natural language input
- 📊 **Analytics & Insights**: Advanced analytics for automation performance, suggestion accuracy, and productivity optimization

### Phase 5: Collaboration & Teams 👥 PLANNED
**Multi-user functionality:**
- [ ] **Real-time Collaboration** - WebSocket-based live updates and presence
- [ ] **Project Sharing** - Share projects with team members
- [ ] **Role-based Permissions** - Admin, member, and viewer roles
- [ ] **Team Dashboard** - Overview of team productivity and workload
- [ ] **Comments & Mentions** - Team communication within tasks
- [ ] **Activity Feed** - Track all project changes and updates

### Phase 6: Platform Expansion 🌐 PLANNED
**Multi-platform presence:**
- [ ] **Mobile Apps** - React Native apps for iOS and Android
- [ ] **Desktop Apps** - Native Windows, macOS, and Linux applications
- [ ] **Browser Extensions** - Quick task capture from any webpage
- [ ] **Email Integration** - Create tasks from emails and send updates
- [ ] **Public API** - RESTful API for third-party integrations
- [ ] **Webhooks** - Real-time notifications for external services

### Phase 7: Enterprise & Analytics 📊 PLANNED
**Business-focused features:**
- [ ] **Advanced Analytics** - Comprehensive reporting and insights
- [ ] **Custom Reports** - Export to PDF/Excel with custom filters
- [ ] **SSO & Security** - Single sign-on and advanced security features
- [ ] **Audit Logs** - Complete activity tracking for compliance
- [ ] **Advanced Templates** - Team templates and template marketplace
- [ ] **White-label Options** - Custom branding for enterprise clients

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Todone** - From to-do to todone ✨

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

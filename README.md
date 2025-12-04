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
- ✅ **Smart Input** - Natural language parsing for quick task creation
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
- **Productivity Dashboard**: Track karma points, streaks, and productivity metrics
- **Task Templates**: Use pre-built templates for common workflows
- **Calendar Export**: Export tasks to iCal format for external calendar apps
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

The application is continuously evolving with a comprehensive roadmap:

### Phase 2: Essential Features
- ✅ **Filters and labels system** - Create custom filters and color-coded labels
- ✅ **Advanced search capabilities** - Filter by priority, date, labels, and custom queries
- ✅ **Three view layouts (list, board, calendar)** - Switch between list, kanban board, and calendar views
- ✅ **Sub-tasks and task hierarchy** - Create nested tasks with parent-child relationships
- ✅ **Drag-and-drop functionality** - Reorder tasks and move them between projects/views
- ✅ **Task comments** - Add comments to tasks for collaboration and context

### Phase 3: Advanced Features
- ✅ **Recurring tasks with scheduler** - Create tasks that repeat daily, weekly, monthly, or yearly with custom patterns
- ✅ **Natural language parsing** - Create tasks using natural language like "Meeting tomorrow at 2pm p1 #work"
- ✅ **Productivity/Karma system** - Gamified task management with points, levels, streaks, and achievements
- ✅ **Calendar integration** - Enhanced calendar view with filtering, export to iCal, and multiple view modes
- ✅ **Templates system** - Pre-built task templates for common workflows like daily planning, project kickoff, and more
- ✅ **Collaboration features** - Share projects, invite team members, and manage permissions

### Phase 4: Polish & AI 📋 PLANNED
- [ ] AI Assist features
- [ ] Offline sync and conflict resolution
- [ ] Advanced animations
- [ ] Mobile responsive design
- [ ] Browser extensions

### Phase 5: Mobile & Advanced Integrations 📋 PLANNED
- [ ] **Mobile App Development** - React Native app for iOS and Android
- [ ] **Advanced Analytics** - Comprehensive reporting and insights dashboard
- [ ] **External Service Integrations** - Google Calendar, Slack, Microsoft Teams, Outlook
- [ ] **Real-time Collaboration** - WebSocket-based live updates and presence
- [ ] **Advanced Time Tracking** - Built-in Pomodoro timer and time analytics
- [ ] **Voice Input & Commands** - Speech-to-text task creation and voice commands
- [ ] **AI-Powered Features** - Smart task suggestions, auto-prioritization, and productivity insights
- [ ] **Advanced Offline Support** - Conflict resolution and sync strategies
- [ ] **Enterprise Features** - SSO, advanced permissions, audit logs
- [ ] **API & Webhooks** - Public API for third-party integrations

### Phase 6: Platform Expansion 📋 PLANNED
- [ ] **Desktop Apps** - Native Windows, macOS, and Linux applications
- [ ] **Browser Extensions** - Chrome, Firefox, Safari extensions for quick task capture
- [ ] **Email Integration** - Create tasks from emails and send task updates via email
- [ ] **Advanced Reporting** - Custom reports, export to PDF/Excel, team analytics
- [ ] **Workflow Automation** - Custom triggers, actions, and automated task management
- [ ] **Advanced Templates** - Team templates, template marketplace, custom template builder
- [ ] **Advanced Collaboration** - Real-time editing, video calls integration, team dashboards
- [ ] **Advanced Security** - End-to-end encryption, advanced audit trails, compliance features

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

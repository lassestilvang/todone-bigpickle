import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  User, 
  Project, 
  Section, 
  Task, 
  Label, 
  Filter, 
  ViewType, 
  TaskQuery,
  SyncStatus 
} from '../types';
import { db } from '../lib/database';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Data state
  projects: Project[];
  sections: Section[];
  tasks: Task[];
  labels: Label[];
  filters: Filter[];
  
  // UI state
  currentView: ViewType;
  currentProjectId: string | null;
  sidebarCollapsed: boolean;
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Sync state
  syncStatus: SyncStatus;
  
  // Settings
  theme: 'light' | 'dark' | 'system';
  showCompletedTasks: boolean;
}

interface AppActions {
  // Authentication
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Projects
  loadProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Sections
  loadSections: () => Promise<void>;
  createSection: (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  
  // Tasks
  loadTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; order: number }[]) => Promise<void>;
  
  // Labels
  loadLabels: () => Promise<void>;
  createLabel: (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  
  // Filters
  loadFilters: () => Promise<void>;
  createFilter: (filter: Omit<Filter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>;
  deleteFilter: (id: string) => Promise<void>;
  
  // UI actions
  setCurrentView: (view: ViewType) => void;
  setCurrentProject: (projectId: string | null) => void;
  toggleSidebar: () => void;
  setSelectedTask: (taskId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Query helpers
  getTasksByQuery: (query: TaskQuery) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  getInboxTasks: () => Task[];
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleShowCompleted: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      projects: [],
      sections: [],
      tasks: [],
      labels: [],
      filters: [],
      currentView: 'inbox',
      currentProjectId: null,
      sidebarCollapsed: false,
      selectedTaskId: null,
      isLoading: false,
      error: null,
      syncStatus: {
        isOnline: navigator.onLine,
        pendingOperations: 0,
        conflicts: []
      },
      theme: 'system',
      showCompletedTasks: false,

      // Authentication actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      login: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // For now, create a mock user
          const mockUser: User = {
            id: 'user-1',
            email,
            name: email.split('@')[0],
            settings: {
              theme: 'system',
              language: 'en',
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h',
              startOfWeek: 'sunday',
              notifications: {
                taskReminders: true,
                comments: true,
                assignments: true,
                dailySummary: false,
                overdueTasks: true,
                goalAchievements: true
              }
            },
            preferences: {
              defaultProject: '',
              defaultPriority: 'p4',
              autoAddTime: false,
              showCompleted: false,
              collapseSections: false
            },
            karma: {
              points: 0,
              level: 'beginner',
              currentLevelPoints: 0,
              nextLevelPoints: 1000,
              weeklyTrend: [],
              dailyGoal: 5,
              weeklyGoal: 25,
              dailyStreak: 0,
              weeklyStreak: 0,
              longestStreak: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await db.users.put(mockUser);
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
        }
      },
      
      logout: async () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          projects: [], 
          sections: [], 
          tasks: [], 
          labels: [], 
          filters: [],
          currentView: 'inbox',
          currentProjectId: null
        });
      },

      // Project actions
      loadProjects: async () => {
        try {
          const projects = await db.projects.toArray();
          set({ projects });
        } catch (error) {
          set({ error: 'Failed to load projects' });
        }
      },

      createProject: async (projectData) => {
        try {
          const order = await db.getNextOrder('projects');
          const project = {
            ...projectData,
            id: `project-${Date.now()}`,
            order
          };
          
          await db.projects.add(project as any);
          const projects = await db.projects.toArray();
          set({ projects });
        } catch (error) {
          set({ error: 'Failed to create project' });
        }
      },

      updateProject: async (id, updates) => {
        try {
          await db.projects.update(id, { ...updates, updatedAt: new Date() });
          const projects = await db.projects.toArray();
          set({ projects });
        } catch (error) {
          set({ error: 'Failed to update project' });
        }
      },

      deleteProject: async (id) => {
        try {
          await db.projects.delete(id);
          const projects = await db.projects.toArray();
          set({ projects });
        } catch (error) {
          set({ error: 'Failed to delete project' });
        }
      },

      // Section actions
      loadSections: async () => {
        try {
          const sections = await db.sections.toArray();
          set({ sections });
        } catch (error) {
          set({ error: 'Failed to load sections' });
        }
      },

      createSection: async (sectionData) => {
        try {
          const order = await db.getNextOrder('sections', sectionData.projectId);
          const section = {
            ...sectionData,
            id: `section-${Date.now()}`,
            order
          };
          
          await db.sections.add(section as any);
          const sections = await db.sections.toArray();
          set({ sections });
        } catch (error) {
          set({ error: 'Failed to create section' });
        }
      },

      updateSection: async (id, updates) => {
        try {
          await db.sections.update(id, { ...updates, updatedAt: new Date() });
          const sections = await db.sections.toArray();
          set({ sections });
        } catch (error) {
          set({ error: 'Failed to update section' });
        }
      },

      deleteSection: async (id) => {
        try {
          await db.sections.delete(id);
          const sections = await db.sections.toArray();
          set({ sections });
        } catch (error) {
          set({ error: 'Failed to delete section' });
        }
      },

      // Task actions
      loadTasks: async () => {
        try {
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch (error) {
          set({ error: 'Failed to load tasks' });
        }
      },

      createTask: async (taskData) => {
        try {
          const order = await db.getNextOrder('tasks', taskData.sectionId);
          const task = {
            ...taskData,
            id: `task-${Date.now()}`,
            order
          };
          
          await db.tasks.add(task as any);
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch (error) {
          set({ error: 'Failed to create task' });
        }
      },

      updateTask: async (id, updates) => {
        try {
          await db.tasks.update(id, { ...updates, updatedAt: new Date() });
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch (error) {
          set({ error: 'Failed to update task' });
        }
      },

      deleteTask: async (id) => {
        try {
          await db.tasks.delete(id);
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch (error) {
          set({ error: 'Failed to delete task' });
        }
      },

      toggleTaskComplete: async (id) => {
        try {
          const task = await db.tasks.get(id);
          if (task) {
            const updates = {
              isCompleted: !task.isCompleted,
              completedAt: !task.isCompleted ? new Date() : undefined
            };
            await db.tasks.update(id, updates);
            const tasks = await db.tasks.toArray();
            set({ tasks });
          }
        } catch (error) {
          set({ error: 'Failed to toggle task completion' });
        }
      },

      reorderTasks: async (reorderedTasks) => {
        try {
          await db.transaction('rw', db.tasks, async () => {
            for (const { id, order } of reorderedTasks) {
              await db.tasks.update(id, { order });
            }
          });
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch (error) {
          set({ error: 'Failed to reorder tasks' });
        }
      },

      // Label actions
      loadLabels: async () => {
        try {
          const labels = await db.labels.toArray();
          set({ labels });
        } catch (error) {
          set({ error: 'Failed to load labels' });
        }
      },

      createLabel: async (labelData) => {
        try {
          const label = {
            ...labelData,
            id: `label-${Date.now()}`,
          };
          
          await db.labels.add(label as any);
          const labels = await db.labels.toArray();
          set({ labels });
        } catch (error) {
          set({ error: 'Failed to create label' });
        }
      },

      updateLabel: async (id, updates) => {
        try {
          await db.labels.update(id, { ...updates, updatedAt: new Date() });
          const labels = await db.labels.toArray();
          set({ labels });
        } catch (error) {
          set({ error: 'Failed to update label' });
        }
      },

      deleteLabel: async (id) => {
        try {
          await db.labels.delete(id);
          const labels = await db.labels.toArray();
          set({ labels });
        } catch (error) {
          set({ error: 'Failed to delete label' });
        }
      },

      // Filter actions
      loadFilters: async () => {
        try {
          const filters = await db.filters.toArray();
          set({ filters });
        } catch (error) {
          set({ error: 'Failed to load filters' });
        }
      },

      createFilter: async (filterData) => {
        try {
          const filter = {
            ...filterData,
            id: `filter-${Date.now()}`,
          };
          
          await db.filters.add(filter as any);
          const filters = await db.filters.toArray();
          set({ filters });
        } catch (error) {
          set({ error: 'Failed to create filter' });
        }
      },

      updateFilter: async (id, updates) => {
        try {
          await db.filters.update(id, { ...updates, updatedAt: new Date() });
          const filters = await db.filters.toArray();
          set({ filters });
        } catch (error) {
          set({ error: 'Failed to update filter' });
        }
      },

      deleteFilter: async (id) => {
        try {
          await db.filters.delete(id);
          const filters = await db.filters.toArray();
          set({ filters });
        } catch (error) {
          set({ error: 'Failed to delete filter' });
        }
      },

      // UI actions
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Query helpers
      getTasksByQuery: (query) => {
        const { tasks } = get();
        return tasks.filter(task => {
          if (query.search && !task.content.toLowerCase().includes(query.search.toLowerCase())) {
            return false;
          }
          if (query.priority && !query.priority.includes(task.priority)) {
            return false;
          }
          if (query.labels && !query.labels.some(label => task.labels.includes(label))) {
            return false;
          }
          if (query.projects && !query.projects.includes(task.projectId || '')) {
            return false;
          }
          if (query.isCompleted !== undefined && task.isCompleted !== query.isCompleted) {
            return false;
          }
          return true;
        });
      },

      getTodayTasks: () => {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return get().tasks.filter(task => 
          task.dueDate && 
          task.dueDate >= startOfDay && 
          task.dueDate <= endOfDay &&
          !task.isCompleted
        );
      },

      getUpcomingTasks: (days = 7) => {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);
        endDate.setHours(23, 59, 59, 999);

        return get().tasks.filter(task => 
          task.dueDate && 
          task.dueDate >= startOfDay && 
          task.dueDate <= endDate &&
          !task.isCompleted
        );
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(task => 
          task.dueDate && 
          task.dueDate < now &&
          !task.isCompleted
        );
      },

      getInboxTasks: () => {
        return get().tasks.filter(task => 
          !task.projectId && 
          !task.isCompleted
        );
      },

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleShowCompleted: () => set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),
    }),
    {
      name: 'todone-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentView: state.currentView,
        currentProjectId: state.currentProjectId,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        showCompletedTasks: state.showCompletedTasks,
      }),
    }
  )
);
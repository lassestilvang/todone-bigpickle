import { create } from "zustand";
import type {
  User,
  Project,
  Section,
  Task,
  Label,
  Filter,
  Comment,
  ViewType,
  TaskQuery,
  SyncStatus,
  RecurringPattern,
  ProductivityStats,
  TimeSession,
  TimeTracking,
} from "../types";

// Minimal store for testing
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  projects: Project[];
  sections: Section[];
  tasks: Task[];
  labels: Label[];
  filters: Filter[];
  comments: Comment[];
  currentView: ViewType;
  currentProjectId: string | null;
  sidebarCollapsed: boolean;
  selectedTaskId: string | null;
  selectedTaskIds: string[];
  selectedLabelId: string | null;
  selectedFilterId: string | null;
  isLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  theme: "light" | "dark" | "system";
  showCompletedTasks: boolean;
}

interface AppActions {
  setUser: (user: User | null) => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProjects: () => Promise<void>;
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loadSections: () => Promise<void>;
  createSection: (section: Omit<Section, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; order: number }[]) => Promise<void>;
  loadLabels: () => Promise<void>;
  createLabel: (label: Omit<Label, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  loadFilters: () => Promise<void>;
  createFilter: (filter: Omit<Filter, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>;
  deleteFilter: (id: string) => Promise<void>;
  setCurrentView: (view: ViewType) => void;
  setCurrentProject: (projectId: string | null) => void;
  setSelectedTask: (taskId: string | null) => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelectedTasks: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleShowCompleted: () => void;
  updateUserSettings: (settingsUpdate: Partial<User['settings']>) => Promise<void>;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState & AppActions>()(
  (set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    projects: [],
    sections: [],
    tasks: [],
    labels: [],
    filters: [],
    comments: [],
    currentView: "inbox",
    currentProjectId: null,
    sidebarCollapsed: false,
    selectedTaskId: null,
    selectedTaskIds: [],
    selectedLabelId: null,
    selectedFilterId: null,
    isLoading: false,
    error: null,
    syncStatus: {
      isOnline: navigator.onLine,
      pendingOperations: 0,
      conflicts: [],
    },
    theme: "system",
    showCompletedTasks: false,

    // Authentication actions
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    login: async (email) => {
      set({ isLoading: true, error: null });
      try {
        // Create a simple mock user
        const mockUser: User = {
          id: "user-1",
          email,
          name: email.split("@")[0],
          settings: {
            theme: "system",
            language: "en",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12h",
            startOfWeek: "sunday",
            notifications: {
              taskReminders: true,
              comments: true,
              assignments: true,
              dailySummary: false,
              overdueTasks: true,
              goalAchievements: true,
            },
          },
          preferences: {
            defaultProject: "",
            defaultPriority: "p4",
            autoAddTime: false,
            showCompleted: false,
            collapseSections: false,
          },
          karma: {
            points: 0,
            level: "beginner",
            currentLevelPoints: 0,
            nextLevelPoints: 1000,
            weeklyTrend: [],
            dailyGoal: 5,
            weeklyGoal: 25,
            dailyStreak: 0,
            weeklyStreak: 0,
            longestStreak: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      } catch {
        set({ error: "Login failed", isLoading: false });
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
        currentView: "inbox",
        currentProjectId: null,
      });
    },

    // Simplified actions for testing
    createTask: async (taskData) => {
      const task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ tasks: [...state.tasks, task] }));
    },

    updateTask: async (id, updates) => {
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
      }));
    },

    deleteTask: async (id) => {
      set((state) => ({ tasks: state.tasks.filter(task => task.id !== id) }));
    },

    toggleTaskComplete: async (id) => {
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date() } : task
        )
      }));
    },

    setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
    
    setCurrentView: (view) => set({ currentView: view }),
    
    // Add other required actions with minimal implementations
    loadProjects: async () => {},
    createProject: async () => {},
    updateProject: async () => {},
    deleteProject: async () => {},
    loadSections: async () => {},
    createSection: async () => {},
    updateSection: async () => {},
    deleteSection: async () => {},
    loadTasks: async () => {},
    reorderTasks: async () => {},
    loadLabels: async () => {},
    createLabel: async () => {},
    updateLabel: async () => {},
    deleteLabel: async () => {},
    loadFilters: async () => {},
    createFilter: async () => {},
    updateFilter: async () => {},
    deleteFilter: async () => {},
    setCurrentProject: (projectId) => set({ currentProjectId: projectId }),
    toggleTaskSelection: (taskId) => {
      set((state) => ({
        selectedTaskIds: state.selectedTaskIds.includes(taskId)
          ? state.selectedTaskIds.filter(id => id !== taskId)
          : [...state.selectedTaskIds, taskId]
      }));
    },
    clearSelectedTasks: () => set({ selectedTaskIds: [] }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setTheme: (theme) => set({ theme }),
    toggleShowCompleted: () => set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),
    updateUserSettings: async () => {},
    loadComments: async () => {},
    createComment: async () => {},
    updateComment: async () => {},
    deleteComment: async () => {},
    selectedLabelId: null,
    selectedFilterId: null,
    syncStatus: {
      isOnline: navigator.onLine,
      pendingOperations: 0,
      conflicts: [],
    },
  }),
);

// Simple selectors for testing
export const useTasks = () => useAppStore(state => state.tasks);
export const useProjects = () => useAppStore(state => state.projects);
export const useLabels = () => useAppStore(state => state.labels);
export const useCurrentView = () => useAppStore(state => state.currentView);
export const useSelectedTaskId = () => useAppStore(state => state.selectedTaskId);
export const useSelectedTaskIds = () => useAppStore(state => state.selectedTaskIds);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);
export const useTheme = () => useAppStore(state => state.theme);
export const useUser = () => useAppStore(state => state.user);

// Action selectors
export const useTaskActions = () => useAppStore(state => ({
  createTask: state.createTask,
  updateTask: state.updateTask,
  deleteTask: state.deleteTask,
  toggleTaskComplete: state.toggleTaskComplete,
  reorderTasks: state.reorderTasks,
}));

export const useUIActions = () => useAppStore(state => ({
  setCurrentView: state.setCurrentView,
  setSelectedTask: state.setSelectedTask,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
}));
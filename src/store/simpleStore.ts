import { create } from "zustand";
import type { Task } from "../types";

// Ultra-minimal store for testing
interface AppState {
  tasks: Task[];
  currentView: string;
  selectedTaskId: string | null;
  isLoading: boolean;
  user: unknown;
}

interface AppActions {
  createTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  setSelectedTask: (taskId: string | null) => void;
  setCurrentView: (view: string) => void;
  setUser: (user: unknown) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  (set) => ({
    // Initial state
    tasks: [],
    currentView: "inbox",
    selectedTaskId: null,
    isLoading: false,
    user: null,

    // Actions
    createTask: (task) => {
      set((state) => ({ tasks: [...state.tasks, task] }));
    },

    updateTask: (id, updates) => {
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      }));
    },

    deleteTask: (id) => {
      set((state) => ({ tasks: state.tasks.filter(task => task.id !== id) }));
    },

    toggleTaskComplete: (id) => {
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        )
      }));
    },

    setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
    setCurrentView: (view) => set({ currentView: view }),
    setUser: (user) => set({ user, isLoading: false }),
    setIsLoading: (loading) => set({ isLoading: loading }),
  }),
);

// Simple selectors
export const useTasks = () => useAppStore(state => state.tasks);
export const useCurrentView = () => useAppStore(state => state.currentView);
export const useSelectedTaskId = () => useAppStore(state => state.selectedTaskId);

// Action selector
export const useTaskActions = () => useAppStore(state => ({
  createTask: state.createTask,
  updateTask: state.updateTask,
  deleteTask: state.deleteTask,
  toggleTaskComplete: state.toggleTaskComplete,
}));
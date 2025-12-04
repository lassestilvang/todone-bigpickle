import { create } from "zustand";
import React from "react";
import { persist } from "zustand/middleware";
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
import { db } from "../lib/database";
import { RecurringTaskService } from "../lib/recurringTasks";
import { KarmaService } from "../lib/karmaService";
import { safeAsync } from "../lib/timeoutUtils";

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
  comments: Comment[];

  // UI state
  currentView: ViewType;
  currentProjectId: string | null;
  sidebarCollapsed: boolean;
  selectedTaskId: string | null;
  selectedTaskIds: string[];
  selectedLabelId: string | null;
  selectedFilterId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Modal state
  commentsTaskId: string | null;
  dependenciesTaskId: string | null;
  subtasksParentId: string | null;

  // Sync state
  syncStatus: SyncStatus;

  // Settings
  theme: "light" | "dark" | "system";
  showCompletedTasks: boolean;
}

interface AppActions {
  // Authentication
  setUser: (user: User | null) => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSettings: (settings: Partial<User['settings']>) => Promise<void>;

  // Projects
  loadProjects: () => Promise<void>;
  createProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Sections
  loadSections: () => Promise<void>;
  createSection: (
    section: Omit<Section, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Tasks
  loadTasks: () => Promise<void>;
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; order: number }[]) => Promise<void>;

  // Labels
  loadLabels: () => Promise<void>;
  createLabel: (
    label: Omit<Label, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;

  // Filters
  loadFilters: () => Promise<void>;
  createFilter: (
    filter: Omit<Filter, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateFilter: (id: string, updates: Partial<Filter>) => Promise<void>;
  deleteFilter: (id: string) => Promise<void>;

  // Comments
  loadComments: () => Promise<void>;
  createComment: (
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateComment: (id: string, updates: Partial<Comment>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;

  // Time tracking
  startTimeTracking: (taskId: string) => Promise<void>;
  stopTimeTracking: (taskId: string, description?: string) => Promise<void>;
  addTimeSession: (session: Omit<TimeSession, "id" | "createdAt">) => Promise<void>;
  getTaskTimeTracking: (taskId: string) => TimeTracking | null;
  getDailyTimeStats: (date?: Date) => { totalMinutes: number; tasks: { taskId: string; minutes: number }[] };

  // UI actions
  setCurrentView: (view: ViewType) => void;
  setCurrentProject: (projectId: string | null) => void;
  toggleSidebar: () => void;
  setSelectedTask: (taskId: string | null) => void;
  setSelectedTasks: (taskIds: string[]) => void;
  addSelectedTask: (taskId: string) => void;
  removeSelectedTask: (taskId: string) => void;
  clearSelectedTasks: () => void;
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  setSelectedLabel: (labelId: string | null) => void;
  setSelectedFilter: (filterId: string | null) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Modal actions
  setCommentsTaskId: (taskId: string | null) => void;
  setDependenciesTaskId: (taskId: string | null) => void;
  setSubtasksParentId: (parentId: string | null) => void;

  // Query helpers
  getTasksByQuery: (query: TaskQuery) => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: (days?: number) => Task[];
  getOverdueTasks: () => Task[];
  getInboxTasks: () => Task[];
  getCompletedTasks: () => Task[];

  // Sub-task helpers
  getSubtasks: (parentTaskId: string) => Task[];
  getParentTask: (taskId: string) => Task | null;
  getTaskHierarchy: (taskId: string) => Task[];
  createSubtask: (
    parentTaskId: string,
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "parentTaskId">,
  ) => Promise<void>;
  moveTaskToParent: (taskId: string, newParentTaskId?: string) => Promise<void>;

  // Comment helpers
  getTaskComments: (taskId: string) => Comment[];

  // Recurring tasks
  setTaskRecurringPattern: (taskId: string, pattern: RecurringPattern | undefined) => Promise<void>;
  generateRecurringOccurrences: (taskId: string) => Promise<void>;
  getRecurringTasks: () => Task[];
  getNextRecurringOccurrences: (days: number) => Task[];

  // Karma system
  updateUserKarma: (points: number) => Promise<void>;
  getProductivityStats: (timeframe?: 'today' | 'week' | 'month') => ProductivityStats | null;

  // Theme
  setTheme: (theme: "light" | "dark" | "system") => void;
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
      
      // Modal state
      commentsTaskId: null,
      dependenciesTaskId: null,
      subtasksParentId: null,
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
          // For now, create a mock user with stable dates
          const now = new Date();
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
            createdAt: now,
            updatedAt: now,
          };

          await db.users.put(mockUser);
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

      // Project actions
      loadProjects: async () => {
        try {
          const projects = await db.projects.toArray();
          set({ projects });
        } catch {
          set({ error: "Failed to load projects" });
        }
      },

      createProject: async (projectData) => {
        try {
          const order = await db.getNextOrder("projects");
          const project = {
            ...projectData,
            id: `project-${Date.now()}`,
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.projects.add(project);
          // Optimistic update instead of full reload
          set((state) => ({
            projects: [...state.projects, project]
          }));
        } catch {
          set({ error: "Failed to create project" });
        }
      },

      updateProject: async (id, updates) => {
        try {
          await db.projects.update(id, { ...updates, updatedAt: new Date() });
          // Optimistic update instead of full reload
          set((state) => ({
            projects: state.projects.map(project => 
              project.id === id 
                ? { ...project, ...updates, updatedAt: new Date() } 
                : project
            )
          }));
        } catch {
          set({ error: "Failed to update project" });
        }
      },

      deleteProject: async (id) => {
        try {
          await db.projects.delete(id);
          // Optimistic update instead of full reload
          set((state) => ({
            projects: state.projects.filter(project => project.id !== id)
          }));
        } catch {
          set({ error: "Failed to delete project" });
        }
      },

      // Section actions
      loadSections: async () => {
        try {
          const sections = await db.sections.toArray();
          set({ sections });
        } catch {
          set({ error: "Failed to load sections" });
        }
      },

      createSection: async (sectionData) => {
        try {
          const order = await db.getNextOrder(
            "sections",
            sectionData.projectId,
          );
          const section = {
            ...sectionData,
            id: `section-${Date.now()}`,
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.sections.add(section);
          const sections = await db.sections.toArray();
          set({ sections });
        } catch {
          set({ error: "Failed to create section" });
        }
      },

      updateSection: async (id, updates) => {
        try {
          await db.sections.update(id, { ...updates, updatedAt: new Date() });
          const sections = await db.sections.toArray();
          set({ sections });
        } catch {
          set({ error: "Failed to update section" });
        }
      },

      deleteSection: async (id) => {
        try {
          await db.sections.delete(id);
          const sections = await db.sections.toArray();
          set({ sections });
        } catch {
          set({ error: "Failed to delete section" });
        }
      },

      // Task actions
      loadTasks: async () => {
        try {
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch {
          set({ error: "Failed to load tasks" });
        }
      },

      createTask: async (taskData) => {
        try {
          const { tasks: currentTasks } = get();
          const order = currentTasks.length;

          const task = {
            ...taskData,
            id: `task-${Date.now()}`,
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await safeAsync(() => db.tasks.add(task), 5000);
          
          // Optimistic update - add task to existing array
          set(state => ({ tasks: [...state.tasks, task] }));
        } catch (error) {
          console.error('Create task error:', error);
          set({ error: "Failed to create task" });
          // Reload on error to maintain consistency
          const tasks = await safeAsync(() => db.tasks.toArray(), 3000);
          if (tasks !== undefined) {
            set({ tasks });
          }
        }
      },

      updateTask: async (id, updates) => {
        try {
          const updateData = { ...updates, updatedAt: new Date() };
          await safeAsync(() => db.tasks.update(id, updateData), 5000);
          
          // Optimistic update - update task in existing array
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === id ? { ...task, ...updateData } : task
            )
          }));
        } catch (error) {
          console.error('Update task error:', error);
          set({ error: "Failed to update task" });
          // Reload on error to maintain consistency
          const tasks = await safeAsync(() => db.tasks.toArray(), 3000);
          if (tasks !== undefined) {
            set({ tasks });
          }
        }
      },

      deleteTask: async (id) => {
        try {
          await db.tasks.delete(id);
          
          // Optimistic update - remove task from existing array
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id)
          }));
        } catch {
          set({ error: "Failed to delete task" });
          // Reload on error to maintain consistency
          const tasks = await db.tasks.toArray();
          set({ tasks });
        }
      },

      toggleTaskComplete: async (id) => {
        try {
          const task = await db.tasks.get(id);
          if (task) {
            const isCompleting = !task.isCompleted;
            const updates = {
              isCompleted: isCompleting,
              completedAt: isCompleting ? new Date() : undefined,
            };
            await db.tasks.update(id, updates);
            
            // If completing a task, award karma points
            if (isCompleting) {
              const { user } = get();
              if (user) {
                const points = KarmaService.calculateTaskCompletionPoints(task);
                const updatedUser = KarmaService.updateKarmaStats(user, {
                  id: `karma-${Date.now()}`,
                  type: 'task_completed',
                  points,
                  description: `Completed task: ${task.content}`,
                  timestamp: new Date(),
                  taskId: task.id,
                });
                await db.users.put(updatedUser);
                set({ user: updatedUser });
              }
              
              // If completing a recurring task, generate next occurrence
              if (task.recurringPattern) {
                const nextOccurrence = RecurringTaskService.createNextOccurrence(task);
                if (nextOccurrence) {
                  await db.tasks.add(nextOccurrence);
                }
              }
            }
            
            // Optimistic update - update task in existing array
            set(state => ({
              tasks: state.tasks.map(task => 
                task.id === id ? { ...task, ...updates } : task
              )
            }));
          }
        } catch {
          set({ error: "Failed to toggle task completion" });
        }
      },

      reorderTasks: async (reorderedTasks) => {
        try {
          await db.transaction("rw", db.tasks, async () => {
            for (const { id, order } of reorderedTasks) {
              await db.tasks.update(id, { order });
            }
          });
          
          // Optimistic update - update tasks in existing array
          set(state => ({
            tasks: state.tasks.map(task => {
              const reorderedTask = reorderedTasks.find((rt: { id: string; order: number }) => rt.id === task.id);
              return reorderedTask ? { ...task, order: reorderedTask.order } : task;
            })
          }));
        } catch {
          set({ error: "Failed to reorder tasks" });
          // Reload on error to maintain consistency
          const tasks = await db.tasks.toArray();
          set({ tasks });
        }
      },

      // Label actions
      loadLabels: async () => {
        try {
          const labels = await db.labels.toArray();
          set({ labels });
        } catch {
          set({ error: "Failed to load labels" });
        }
      },

      createLabel: async (labelData: Omit<Label, "id" | "createdAt" | "updatedAt">) => {
        try {
          const label = {
            ...labelData,
            id: `label-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.labels.add(label);
          const labels = await db.labels.toArray();
          set({ labels });
        } catch {
          set({ error: "Failed to create label" });
        }
      },

      updateLabel: async (id, updates) => {
        try {
          await db.labels.update(id, { ...updates, updatedAt: new Date() });
          const labels = await db.labels.toArray();
          set({ labels });
        } catch {
          set({ error: "Failed to update label" });
        }
      },

      deleteLabel: async (id) => {
        try {
          await db.labels.delete(id);
          const labels = await db.labels.toArray();
          set({ labels });
        } catch {
          set({ error: "Failed to delete label" });
        }
      },

      // Filter actions
      loadFilters: async () => {
        try {
          const filters = await db.filters.toArray();
          set({ filters });
        } catch {
          set({ error: "Failed to load filters" });
        }
      },

      createFilter: async (
        filterData: Omit<Filter, "id" | "createdAt" | "updatedAt">,
      ) => {
        try {
          const filter = {
            ...filterData,
            id: `filter-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.filters.add(filter);
          const filters = await db.filters.toArray();
          set({ filters });
        } catch {
          set({ error: "Failed to create filter" });
        }
      },

      updateFilter: async (id, updates) => {
        try {
          await db.filters.update(id, { ...updates, updatedAt: new Date() });
          const filters = await db.filters.toArray();
          set({ filters });
        } catch {
          set({ error: "Failed to update filter" });
        }
      },

      deleteFilter: async (id) => {
        try {
          await db.filters.delete(id);
          const filters = await db.filters.toArray();
          set({ filters });
        } catch {
          set({ error: "Failed to delete filter" });
        }
      },

      // UI actions
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),
      setSelectedTasks: (taskIds) => set({ selectedTaskIds: taskIds }),
      addSelectedTask: (taskId) => set((state) => ({ 
        selectedTaskIds: [...state.selectedTaskIds, taskId] 
      })),
      removeSelectedTask: (taskId) => set((state) => ({ 
        selectedTaskIds: state.selectedTaskIds.filter(id => id !== taskId) 
      })),
      clearSelectedTasks: () => set({ selectedTaskIds: [] }),
      toggleTaskSelection: (taskId) => set((state) => {
        const isSelected = state.selectedTaskIds.includes(taskId);
        return {
          selectedTaskIds: isSelected 
            ? state.selectedTaskIds.filter(id => id !== taskId)
            : [...state.selectedTaskIds, taskId]
        };
      }),
      selectAllTasks: (taskIds) => set({ selectedTaskIds: taskIds }),
      setSelectedLabel: (labelId: string | null) => set({ selectedLabelId: labelId }),
      setSelectedFilter: (filterId: string | null) => set({ selectedFilterId: filterId }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Modal actions
      setCommentsTaskId: (taskId: string | null) => set({ commentsTaskId: taskId }),
      setDependenciesTaskId: (taskId: string | null) => set({ dependenciesTaskId: taskId }),
      setSubtasksParentId: (parentId: string | null) => set({ subtasksParentId: parentId }),

      // Query helpers
      getTasksByQuery: (query) => {
        const { tasks } = get();
        return tasks.filter((task) => {
          if (
            query.search &&
            !task.content.toLowerCase().includes(query.search.toLowerCase())
          ) {
            return false;
          }
          if (query.priority && !query.priority.includes(task.priority)) {
            return false;
          }
          if (
            query.labels &&
            !query.labels.some((label) => task.labels.includes(label))
          ) {
            return false;
          }
          if (
            query.projects &&
            !query.projects.includes(task.projectId || "")
          ) {
            return false;
          }
          if (
            query.isCompleted !== undefined &&
            task.isCompleted !== query.isCompleted
          ) {
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

        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.dueDate >= startOfDay &&
            task.dueDate <= endOfDay &&
            !task.isCompleted &&
            !task.parentTaskId,
        );
      },

      getUpcomingTasks: (days = 7) => {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);
        endDate.setHours(23, 59, 59, 999);

        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.dueDate >= startOfDay &&
            task.dueDate <= endDate &&
            !task.isCompleted &&
            !task.parentTaskId,
        );
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.dueDate < now &&
            !task.isCompleted &&
            !task.parentTaskId,
        );
      },

      getInboxTasks: () => {
        return get().tasks.filter(
          (task) => !task.projectId && !task.isCompleted && !task.parentTaskId,
        );
      },

      getCompletedTasks: () => {
        return get().tasks.filter(
          (task) => task.isCompleted && !task.parentTaskId,
        ).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
      },

      // Sub-task helpers
      getSubtasks: (parentTaskId) => {
        const { tasks } = get();
        return tasks
          .filter((task) => task.parentTaskId === parentTaskId)
          .sort((a, b) => a.order - b.order);
      },

      getParentTask: (taskId) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task?.parentTaskId) return null;
        return tasks.find((t) => t.id === task.parentTaskId) || null;
      },

      getTaskHierarchy: (taskId) => {
        const { tasks } = get();
        const hierarchy: Task[] = [];
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return hierarchy;

        // Find all descendants
        const findDescendants = (parentId: string) => {
          const children = tasks.filter((t) => t.parentTaskId === parentId);
          children.forEach((child) => {
            hierarchy.push(child);
            findDescendants(child.id);
          });
        };

        hierarchy.push(task);
        findDescendants(taskId);
        return hierarchy;
      },

      createSubtask: async (parentTaskId, taskData) => {
        try {
          const order = await db.getNextOrder("tasks", taskData.sectionId);
          const task = {
            ...taskData,
            id: `task-${Date.now()}`,
            parentTaskId,
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.tasks.add(task);
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch {
          set({ error: "Failed to create subtask" });
        }
      },

      moveTaskToParent: async (taskId, newParentTaskId) => {
        try {
          await db.tasks.update(taskId, { parentTaskId: newParentTaskId });
          const tasks = await db.tasks.toArray();
          set({ tasks });
        } catch {
          set({ error: "Failed to move task" });
        }
      },

      // Comments
      loadComments: async () => {
        try {
          const comments = await db.comments.toArray();
          set({ comments });
        } catch {
          set({ error: "Failed to load comments" });
        }
      },

      createComment: async (
        commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">,
      ) => {
        try {
          const comment = {
            ...commentData,
            id: `comment-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.comments.add(comment);
          const comments = await db.comments.toArray();
          set({ comments });
        } catch {
          set({ error: "Failed to create comment" });
        }
      },

      updateComment: async (id, updates) => {
        try {
          await db.comments.update(id, { ...updates, updatedAt: new Date() });
          const comments = await db.comments.toArray();
          set({ comments });
        } catch {
          set({ error: "Failed to update comment" });
        }
      },

      deleteComment: async (id: string) => {
        try {
          await db.comments.delete(id);
          const comments = await db.comments.toArray();
          set({ comments });
        } catch {
          set({ error: "Failed to delete comment" });
        }
      },

      getTaskComments: (taskId: string) => {
        const { comments } = get();
        return comments
          .filter((comment) => comment.taskId === taskId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },

      // Time tracking
      startTimeTracking: async (taskId) => {
        try {
          const task = await db.tasks.get(taskId);
          if (!task) return;

          // Stop any existing tracking session
          const { tasks } = get();
          const currentlyTracking = tasks.find(t => t.timeTracking?.isTracking);
          if (currentlyTracking) {
            await get().stopTimeTracking(currentlyTracking.id);
          }

          const timeTracking: TimeTracking = {
            totalTime: task.timeTracking?.totalTime || 0,
            sessions: task.timeTracking?.sessions || [],
            isTracking: true,
            currentSessionStart: new Date(),
          };

          await db.tasks.update(taskId, { 
            timeTracking,
            updatedAt: new Date()
          });
          
          const allTasks = await db.tasks.toArray();
          set({ tasks: allTasks });
        } catch {
          set({ error: "Failed to start time tracking" });
        }
      },

      stopTimeTracking: async (taskId, description) => {
        try {
          const task = await db.tasks.get(taskId);
          if (!task?.timeTracking?.isTracking || !task.timeTracking.currentSessionStart) return;

          const endTime = new Date();
          const duration = Math.round((endTime.getTime() - task.timeTracking.currentSessionStart.getTime()) / (1000 * 60));

          const session: TimeSession = {
            id: `session-${Date.now()}`,
            taskId,
            startTime: task.timeTracking.currentSessionStart,
            endTime,
            duration,
            description,
            createdAt: new Date(),
          };

          const updatedTimeTracking: TimeTracking = {
            totalTime: task.timeTracking.totalTime + duration,
            sessions: [...task.timeTracking.sessions, session],
            isTracking: false,
          };

          await db.tasks.update(taskId, { 
            timeTracking: updatedTimeTracking,
            updatedAt: new Date()
          });
          
          // Optimistic update - update task in existing array
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === taskId 
                ? { ...task, timeTracking: updatedTimeTracking, updatedAt: new Date() }
                : task
            )
          }));
        } catch {
          set({ error: "Failed to stop time tracking" });
        }
      },

      addTimeSession: async (sessionData) => {
        try {
          const session: TimeSession = {
            ...sessionData,
            id: `session-${Date.now()}`,
            createdAt: new Date(),
          };

          const task = await db.tasks.get(sessionData.taskId);
          if (!task) return;

          const updatedTimeTracking: TimeTracking = {
            totalTime: (task.timeTracking?.totalTime || 0) + (sessionData.duration || 0),
            sessions: [...(task.timeTracking?.sessions || []), session],
            isTracking: task.timeTracking?.isTracking || false,
            currentSessionStart: task.timeTracking?.currentSessionStart,
          };

          await db.tasks.update(sessionData.taskId, { 
            timeTracking: updatedTimeTracking,
            updatedAt: new Date()
          });
          
          // Optimistic update - update task in existing array
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === sessionData.taskId 
                ? { ...task, timeTracking: updatedTimeTracking, updatedAt: new Date() }
                : task
            )
          }));
        } catch {
          set({ error: "Failed to add time session" });
        }
      },

      getTaskTimeTracking: (taskId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        return task?.timeTracking || null;
      },

      getDailyTimeStats: (date = new Date()) => {
        const { tasks } = get();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const taskStats: { taskId: string; minutes: number }[] = [];
        let totalMinutes = 0;

        tasks.forEach(task => {
          if (!task.timeTracking) return;
          
          const daySessions = task.timeTracking.sessions.filter(session => 
            session.startTime >= startOfDay && session.startTime <= endOfDay
          );
          
          const dayMinutes = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
          
          if (dayMinutes > 0) {
            taskStats.push({ taskId: task.id, minutes: dayMinutes });
            totalMinutes += dayMinutes;
          }
        });

        return { totalMinutes, tasks: taskStats };
      },

      // Recurring tasks
      setTaskRecurringPattern: async (taskId, pattern) => {
        try {
          await db.tasks.update(taskId, { 
            recurringPattern: pattern,
            updatedAt: new Date()
          });
          const tasks = await db.tasks.toArray();
          set({ tasks });

          // If pattern was set, generate initial occurrences
          if (pattern) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const occurrences = RecurringTaskService.generateFutureOccurrences(task, 5);
              for (const occurrence of occurrences) {
                await db.tasks.add(occurrence);
              }
              const updatedTasks = await db.tasks.toArray();
              set({ tasks: updatedTasks });
            }
          }
        } catch {
          set({ error: "Failed to set recurring pattern" });
        }
      },

      generateRecurringOccurrences: async (taskId) => {
        try {
          const task = await db.tasks.get(taskId);
          if (task?.recurringPattern && task.isCompleted) {
            const nextOccurrence = RecurringTaskService.createNextOccurrence(task);
            if (nextOccurrence) {
              await db.tasks.add(nextOccurrence);
              
              // Optimistic update - add new occurrence to existing array
              set(state => ({
                tasks: [...state.tasks, nextOccurrence]
              }));
            }
          }
        } catch {
          set({ error: "Failed to generate recurring occurrence" });
        }
      },

      getRecurringTasks: () => {
        const { tasks } = get();
        return tasks.filter(task => task.recurringPattern && !task.isCompleted);
      },

      getNextRecurringOccurrences: (days = 7) => {
        const { tasks } = get();
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        return tasks.filter(task => {
          if (!task.recurringPattern || task.isCompleted) return false;
          if (!task.dueDate) return false;
          
          return task.dueDate >= now && task.dueDate <= endDate;
        }).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
      },

      // Karma system
      updateUserKarma: async (points) => {
        try {
          const { user } = get();
          if (!user) return;

          const updatedUser = KarmaService.updateKarmaStats(user, {
            id: `karma-${Date.now()}`,
            type: 'bonus',
            points,
            description: `Bonus ${points} karma points`,
            timestamp: new Date(),
          });

          await db.users.put(updatedUser);
          set({ user: updatedUser });
        } catch {
          set({ error: "Failed to update karma" });
        }
      },

      getProductivityStats: (timeframe = 'today') => {
        const { user, tasks } = get();
        if (!user) return null;
        return KarmaService.calculateProductivityStats(tasks, user.id, timeframe);
      },

      // User settings
      updateUserSettings: async (settingsUpdate) => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = {
            ...user,
            settings: {
              ...user.settings,
              ...settingsUpdate
            },
            updatedAt: new Date()
          };
          
          await db.users.put(updatedUser);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Failed to update user settings:', error);
          set({ error: "Failed to update user settings" });
        }
      },

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleShowCompleted: () =>
        set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),
    }),
    {
      name: "todone-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentView: state.currentView,
        currentProjectId: state.currentProjectId,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        showCompletedTasks: state.showCompletedTasks,
      }),
    },
  )
);

// Selectors for optimized component subscriptions
export const useTasks = () => useAppStore(state => state.tasks);
export const useProjects = () => useAppStore(state => state.projects);
export const useLabels = () => useAppStore(state => state.labels);
export const useFilters = () => useAppStore(state => state.filters);
export const useCurrentView = () => useAppStore(state => state.currentView);
export const useCurrentProjectId = () => useAppStore(state => state.currentProjectId);
export const useSelectedTaskId = () => useAppStore(state => state.selectedTaskId);
export const useSelectedTaskIds = () => useAppStore(state => state.selectedTaskIds);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useError = () => useAppStore(state => state.error);
export const useTheme = () => useAppStore(state => state.theme);
export const useUser = () => useAppStore(state => state.user);

export const useTask = (id: string) => useAppStore(
  state => state.tasks.find(task => task.id === id)
);

export const useTasksByProject = (projectId: string) => useAppStore(
  state => state.tasks.filter(task => task.projectId === projectId && !task.parentTaskId)
);

export const useTasksByLabel = (labelId: string) => useAppStore(
  state => state.tasks.filter(task => task.labels?.includes(labelId) && !task.parentTaskId)
);

export const useTodayTasks = () => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return tasks.filter(
      task => task.dueDate &&
        task.dueDate >= startOfDay &&
        task.dueDate <= endOfDay &&
        !task.isCompleted &&
        !task.parentTaskId
    );
  }, [tasks]);
};

export const useOverdueTasks = () => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => {
    const now = new Date();
    return tasks.filter(
      task => task.dueDate &&
        task.dueDate < now &&
        !task.isCompleted &&
        !task.parentTaskId
    );
  }, [tasks]);
};

export const useUpcomingTasks = () => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => {
    const now = new Date();
    const future = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return tasks.filter(
      task => task.dueDate &&
        task.dueDate >= now &&
        task.dueDate <= future &&
        !task.isCompleted &&
        !task.parentTaskId
    );
  }, [tasks]);
};

  export const useTasksByQuery = (query: TaskQuery) => {
    const tasks = useAppStore(state => state.tasks);
    return React.useMemo(() => {
      let filtered = [...tasks];

    // Apply filters based on query
    if (query.projects && query.projects.length > 0) {
      filtered = filtered.filter(task => 
        query.projects!.includes(task.projectId || '')
      );
    }
    
    if (query.labels && query.labels.length > 0) {
      filtered = filtered.filter(task => 
        query.labels!.some(labelId => task.labels.includes(labelId))
      );
    }
    
    if (query.priority && query.priority.length > 0) {
      filtered = filtered.filter(task => query.priority!.includes(task.priority));
    }
    
    if (query.isCompleted !== undefined) {
      filtered = filtered.filter(task => task.isCompleted === query.isCompleted);
    }
    
    if (query.dateRange) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate.getTime();
        const start = query.dateRange!.start?.getTime() || 0;
        const end = query.dateRange!.end?.getTime() || 8640000000000000; // Far future date
        return taskDate >= start && taskDate <= end;
      });
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.content.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }, [tasks, query.projects, query.labels, query.priority, query.isCompleted, query.dateRange, query.search]);
};

export const useInboxTasks = () => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => 
    tasks.filter(task => !task.projectId && !task.isCompleted && !task.parentTaskId),
    [tasks]
  );
};

export const useCompletedTasks = () => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => 
    tasks.filter(task => task.isCompleted && !task.parentTaskId)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)),
    [tasks]
  );
};

export const useSubtasks = (parentTaskId: string) => {
  const tasks = useAppStore(state => state.tasks);
  return React.useMemo(() => 
    tasks
      .filter(task => task.parentTaskId === parentTaskId)
      .sort((a, b) => a.order - b.order),
    [tasks, parentTaskId]
  );
};

// Action selectors for better performance
export const useTaskActions = () => useAppStore(state => ({
  createTask: state.createTask,
  updateTask: state.updateTask,
  deleteTask: state.deleteTask,
  toggleTaskComplete: state.toggleTaskComplete,
  reorderTasks: state.reorderTasks,
  getSubtasks: state.getSubtasks
}));

export const useProjectActions = () => useAppStore(state => ({
  createProject: state.createProject,
  updateProject: state.updateProject,
  deleteProject: state.deleteProject,
  loadProjects: state.loadProjects
}));

export const useUIActions = () => useAppStore(state => ({
  setCurrentView: state.setCurrentView,
  setCurrentProject: state.setCurrentProject,
  setSelectedTask: state.setSelectedTask,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme
}));

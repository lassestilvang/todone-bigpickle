// Core data types for Todone application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  settings: UserSettings;
  preferences: UserPreferences;
  karma: KarmaStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  startOfWeek: 'sunday' | 'monday';
  notifications: NotificationSettings;
}

export interface UserPreferences {
  defaultProject: string;
  defaultPriority: Priority;
  autoAddTime: boolean;
  showCompleted: boolean;
  collapseSections: boolean;
}

export interface NotificationSettings {
  taskReminders: boolean;
  comments: boolean;
  assignments: boolean;
  dailySummary: boolean;
  overdueTasks: boolean;
  goalAchievements: boolean;
}

export interface KarmaStats {
  points: number;
  level: KarmaLevel;
  currentLevelPoints: number;
  nextLevelPoints: number;
  weeklyTrend: number[];
  dailyGoal: number;
  weeklyGoal: number;
  dailyStreak: number;
  weeklyStreak: number;
  longestStreak: number;
}

export type KarmaLevel = 
  | 'beginner'
  | 'novice' 
  | 'intermediate'
  | 'advanced'
  | 'professional'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'enlightened';

export interface Project {
  id: string;
  name: string;
  color: string;
  viewMode: ViewMode;
  isFavorite: boolean;
  isShared: boolean;
  parentId?: string;
  ownerId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  projectId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  content: string;
  description?: string;
  projectId?: string;
  sectionId?: string;
  priority: Priority;
  labels: string[];
  dueDate?: Date;
  dueTime?: string;
  duration?: number; // in minutes
  recurringPattern?: RecurringPattern;
  assigneeId?: string;
  parentTaskId?: string;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export type ViewMode = 'list' | 'board' | 'calendar';

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  endDate?: Date;
  count?: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  isPersonal: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Filter {
  id: string;
  name: string;
  query: string;
  color: string;
  isFavorite: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  fileName: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  taskId: string;
  type: 'automatic' | 'manual' | 'location';
  time?: string;
  location?: LocationReminder;
  createdAt: Date;
}

export interface LocationReminder {
  latitude: number;
  longitude: number;
  radius: number;
  trigger: 'arriving' | 'leaving';
  address: string;
}

// UI State types
export interface AppState {
  user: User | null;
  projects: Project[];
  sections: Section[];
  tasks: Task[];
  labels: Label[];
  filters: Filter[];
  comments: Comment[];
  currentView: ViewType;
  sidebarCollapsed: boolean;
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'projects' | 'filters' | 'labels';

// Query types for filters
export interface TaskQuery {
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  priority?: Priority[];
  labels?: string[];
  projects?: string[];
  sections?: string[];
  assignee?: string;
  isCompleted?: boolean;
  recurring?: boolean;
  hasSubtasks?: boolean;
  parentTask?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Sync types
export interface SyncOperation {
  type: 'create' | 'update' | 'delete';
  entityType: 'task' | 'project' | 'section' | 'label' | 'filter';
  entityId: string;
  data: any;
  timestamp: Date;
  clientId: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: Date;
  pendingOperations: number;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localData: any;
  remoteData: any;
  timestamp: Date;
}
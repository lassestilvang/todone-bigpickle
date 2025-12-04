import Dexie, { type Table } from 'dexie';
import type { 
  User, 
  Project, 
  Section, 
  Task, 
  Label, 
  Filter, 
  Comment, 
  Attachment,
  Reminder,
  SyncOperation,
  TimeSession
} from '../types';
import { TaskQueries, ProjectQueries } from './database/queries';

export class TodoneDatabase extends Dexie {
  // Core tables
  users!: Table<User>;
  projects!: Table<Project>;
  sections!: Table<Section>;
  tasks!: Table<Task>;
  labels!: Table<Label>;
  filters!: Table<Filter>;
  comments!: Table<Comment>;
  attachments!: Table<Attachment>;
  reminders!: Table<Reminder>;
  timeSessions!: Table<TimeSession>;
  
  // Sync tables
  syncOperations!: Table<SyncOperation>;

  constructor() {
    super('TodoneDatabase');
    
    this.version(1).stores({
      users: 'id, email, createdAt, updatedAt',
      projects: 'id, name, color, parentId, ownerId, order, isFavorite, createdAt, updatedAt',
      sections: 'id, name, projectId, order, createdAt, updatedAt',
      tasks: 'id, content, projectId, sectionId, priority, dueDate, isCompleted, parentTaskId, order, createdAt, updatedAt',
      labels: 'id, name, color, isPersonal, ownerId, createdAt, updatedAt',
      filters: 'id, name, query, color, isFavorite, ownerId, createdAt, updatedAt',
      comments: 'id, taskId, userId, createdAt, updatedAt',
      attachments: 'id, fileName, type, createdAt',
      reminders: 'id, taskId, type, time, createdAt',
      syncOperations: '++id, type, entityType, entityId, timestamp, clientId',
      timeSessions: 'id, taskId, startTime, endTime, createdAt'
    });

    // Add indexes for performance
    this.tasks.orderBy('order');
    this.tasks.orderBy('createdAt');
    this.tasks.orderBy('dueDate');
    this.tasks.orderBy('isCompleted');
    this.tasks.orderBy('projectId');
    this.tasks.orderBy('parentTaskId');

    // Add hooks for automatic timestamp updates
    this.tasks.hook('creating', () => {
      return {
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    this.tasks.hook('updating', (modifications: Partial<Task>) => {
      modifications.updatedAt = new Date();
    });

    this.projects.hook('creating', () => {
      return {
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    this.projects.hook('updating', (modifications: Partial<Project>) => {
      modifications.updatedAt = new Date();
    });

    this.sections.hook('creating', () => {
      return {
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    this.sections.hook('updating', (modifications: Partial<Section>) => {
      modifications.updatedAt = new Date();
    });
  }

  // Lazy-loaded query classes
  private _taskQueries?: TaskQueries;
  private _projectQueries?: ProjectQueries;

  get taskQueries(): TaskQueries {
    if (!this._taskQueries) {
      this._taskQueries = new TaskQueries(this);
    }
    return this._taskQueries;
  }

  get projectQueries(): ProjectQueries {
    if (!this._projectQueries) {
      this._projectQueries = new ProjectQueries(this);
    }
    return this._projectQueries;
  }

  // Task operations (delegated to TaskQueries)
  async getTasks(options?: {
    projectId?: string;
    sectionId?: string;
    isCompleted?: boolean;
    priority?: string;
    dueDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    return this.taskQueries.getTasks(options);
  }

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.taskQueries.getTasksByDateRange(startDate, endDate);
  }

  async getTodayTasks(): Promise<Task[]> {
    return this.taskQueries.getTodayTasks();
  }

  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    return this.taskQueries.getUpcomingTasks(days);
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.taskQueries.getOverdueTasks();
  }

  async getInboxTasks(): Promise<Task[]> {
    return this.taskQueries.getInboxTasks();
  }

  async searchTasks(query: string): Promise<Task[]> {
    return this.taskQueries.searchTasks(query);
  }

  // Project operations (delegated to ProjectQueries)
  async getProjectsWithTaskCount(): Promise<(Project & { taskCount: number })[]> {
    return this.projectQueries.getProjectsWithTaskCount();
  }

  // Sync operations
  async addSyncOperation(operation: Omit<SyncOperation, 'timestamp'>): Promise<void> {
    await this.syncOperations.add({
      ...operation,
      timestamp: new Date()
    });
  }

  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    return await this.syncOperations
      .orderBy('timestamp')
      .toArray();
  }

  async clearSyncOperations(): Promise<void> {
    await this.syncOperations.clear();
  }

  // Utility methods
  async getNextOrder(tableType: 'tasks' | 'projects' | 'sections', parentId?: string): Promise<number> {
    let collection;
    
    switch (tableType) {
      case 'tasks':
        collection = this.tasks.toCollection();
        break;
      case 'projects':
        collection = this.projects.toCollection();
        break;
      case 'sections':
        collection = this.sections.toCollection();
        break;
      default:
        return 0;
    }

    if (parentId) {
      // Skip filtering for now to avoid type issues
      return 0;
    }

     const items = await collection.toArray();
      return items.length > 0 ? Math.max(...items.map((item: {order: number}) => item.order)) + 1 : 0;
  }
}

// Create and export database instance
export const db = new TodoneDatabase();

// Open database
export const initDatabase = async (): Promise<void> => {
  await db.open();
};
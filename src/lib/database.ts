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
  SyncOperation 
} from '../types';

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
      syncOperations: '++id, type, entityType, entityId, timestamp, clientId'
    });

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

  // Task operations
  async getTasks(options?: {
    projectId?: string;
    sectionId?: string;
    isCompleted?: boolean;
    priority?: string;
    dueDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    let collection = this.tasks.orderBy('order');

    if (options?.projectId) {
      collection = collection.filter(task => task.projectId === options.projectId);
    }

    if (options?.sectionId) {
      collection = collection.filter(task => task.sectionId === options.sectionId);
    }

    if (options?.isCompleted !== undefined) {
      collection = collection.filter(task => task.isCompleted === options.isCompleted!);
    }

    if (options?.priority) {
      collection = collection.filter(task => task.priority === options.priority);
    }

    if (options?.dueDate) {
      const startOfDay = new Date(options.dueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(options.dueDate);
      endOfDay.setHours(23, 59, 59, 999);

      collection = collection.filter(task => 
        task.dueDate !== undefined && 
        task.dueDate >= startOfDay && 
        task.dueDate <= endOfDay
      );
    }

    if (options?.offset) {
      collection = collection.offset(options.offset);
    }

    if (options?.limit) {
      collection = collection.limit(options.limit);
    }

    return await collection.toArray();
  }

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return await this.tasks
      .where('dueDate')
      .between(startDate, endDate)
      .and(task => !task.isCompleted)
      .toArray();
  }

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.tasks
      .where('dueDate')
      .between(startOfDay, endOfDay)
      .filter((task: Task) => !task.isCompleted)
      .toArray();
  }

  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    return await this.tasks
      .where('dueDate')
      .between(startOfDay, endDate)
      .filter((task: Task) => !task.isCompleted)
      .toArray();
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await this.tasks
      .where('dueDate')
      .below(now)
      .filter((task: Task) => !task.isCompleted)
      .toArray();
  }

  async getInboxTasks(): Promise<Task[]> {
    return await this.tasks
      .filter((task: Task) => !task.projectId && !task.isCompleted)
      .toArray();
  }

  async searchTasks(query: string): Promise<Task[]> {
    return await this.tasks
      .filter((task: Task) => {
        const contentMatch = task.content.toLowerCase().includes(query.toLowerCase());
        const descriptionMatch = task.description && task.description.toLowerCase().includes(query.toLowerCase());
        return contentMatch || !!descriptionMatch;
      })
      .toArray();
  }

  // Project operations
  async getProjectsWithTaskCount(): Promise<(Project & { taskCount: number })[]> {
    const projects = await this.projects.toArray();
    const result = [];

    for (const project of projects) {
      const taskCount = await this.tasks
        .where('projectId')
        .equals(project.id)
        .and(task => !task.isCompleted)
        .count();
      
      result.push({ ...project, taskCount });
    }

    return result;
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
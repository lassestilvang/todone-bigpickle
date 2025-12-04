import type { Task, Project } from '../../types';
import { TodoneDatabase } from '../database';

export class TaskQueries {
  private db: TodoneDatabase;

  constructor(db: TodoneDatabase) {
    this.db = db;
  }

  async getTasks(options?: {
    projectId?: string;
    sectionId?: string;
    isCompleted?: boolean;
    priority?: string;
    dueDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Task[]> {
    let collection = this.db.tasks.orderBy('order');

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
    return await this.db.tasks
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

    return await this.db.tasks
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

    return await this.db.tasks
      .where('dueDate')
      .between(startOfDay, endDate)
      .filter((task: Task) => !task.isCompleted)
      .toArray();
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await this.db.tasks
      .where('dueDate')
      .below(now)
      .filter((task: Task) => !task.isCompleted)
      .toArray();
  }

  async getInboxTasks(): Promise<Task[]> {
    return await this.db.tasks
      .filter((task: Task) => !task.projectId && !task.isCompleted)
      .toArray();
  }

  async searchTasks(query: string): Promise<Task[]> {
    return await this.db.tasks
      .filter((task: Task) => {
        const contentMatch = task.content.toLowerCase().includes(query.toLowerCase());
        const descriptionMatch = task.description && task.description.toLowerCase().includes(query.toLowerCase());
        return contentMatch || !!descriptionMatch;
      })
      .toArray();
  }
}

export class ProjectQueries {
  private db: TodoneDatabase;

  constructor(db: TodoneDatabase) {
    this.db = db;
  }

  async getProjectsWithTaskCount(): Promise<(Project & { taskCount: number })[]> {
    const projects = await this.db.projects.toArray();
    const result = [];

    for (const project of projects) {
      const taskCount = await this.db.tasks
        .where('projectId')
        .equals(project.id)
        .and(task => !task.isCompleted)
        .count();
      
      result.push({ ...project, taskCount });
    }

    return result;
  }
}
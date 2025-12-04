import type { Task } from '../types';

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: Date;
  taskId?: string;
  type: 'reminder' | 'overdue' | 'completed' | 'achievement';
  read: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private checkInterval: number | null = null;

  private constructor() {
    this.requestPermission();
    this.startPeriodicCheck();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private startPeriodicCheck(): void {
    // Check for due tasks every minute
    this.checkInterval = setInterval(() => {
      this.checkForDueTasks();
    }, 60000); // 1 minute
  }

  private async checkForDueTasks(): Promise<void> {
    const tasks = this.getAllTasks(); // This would come from your store
    const now = new Date();

    tasks.forEach(task => {
      if (task.isCompleted || !task.dueDate) return;

      const dueTime = new Date(task.dueDate);
      const timeDiff = dueTime.getTime() - now.getTime();
      
      // Check if task is due in the next 15 minutes
      if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
        this.scheduleReminder(task, timeDiff);
      }
      
      // Check if task is overdue
      if (timeDiff < 0) {
        this.checkOverdueNotification(task, now);
      }
    });
  }

  private scheduleReminder(task: Task, delay: number): void {
    setTimeout(() => {
      this.showNotification({
        title: 'Task Due Soon',
        body: `"${task.content}" is due soon!`,
        taskId: task.id,
        type: 'reminder',
      });
    }, delay);
  }

  private checkOverdueNotification(task: Task, now: Date): void {
    const lastNotified = this.getLastNotified(task.id, 'overdue');
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    if (!lastNotified || lastNotified < oneHourAgo) {
      this.showNotification({
        title: 'Task Overdue',
        body: `"${task.content}" is overdue!`,
        taskId: task.id,
        type: 'overdue',
      });
    }
  }

  private getLastNotified(taskId: string, type: string): Date | null {
    const notification = this.notifications
      .filter(n => n.taskId === taskId && n.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    return notification?.timestamp || null;
  }

  private getAllTasks(): Task[] {
    // This should be connected to your store
    // For now, return empty array - in real implementation, this would get from store
    try {
      // Try to get tasks from global store or window
      if (typeof window !== 'undefined' && (window as unknown as { todoneStore: { getTasks: () => Task[] } }).todoneStore) {
        return (window as unknown as { todoneStore: { getTasks: () => Task[] } }).todoneStore.getTasks();
      }
    } catch (error) {
      console.warn('Could not access task store:', error);
    }
    return [];
  }

  // Method to inject store reference
  setStore(store: { getTasks: () => Task[] }): void {
    (window as unknown as { todoneStore: { getTasks: () => Task[] } }).todoneStore = store;
  }

  async showNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const fullNotification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to internal notifications array
    this.notifications.unshift(fullNotification);
    this.notifyListeners();

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.ico',
        tag: notificationData.taskId || 'general',
        requireInteraction: notificationData.type === 'overdue',
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notificationData.taskId) {
          // Navigate to task detail
          this.navigateToTask(notificationData.taskId);
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-overdue notifications
      if (notificationData.type !== 'overdue') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }

  private navigateToTask(taskId: string): void {
    // This should integrate with your router/navigation
    console.log('Navigate to task:', taskId);
    // Example: window.location.hash = `/task/${taskId}`;
    
    // Try to select the task in the store
    try {
      if (typeof window !== 'undefined' && (window as unknown as { todoneStore: { setSelectedTask: (id: string) => void } }).todoneStore) {
        (window as unknown as { todoneStore: { setSelectedTask: (id: string) => void } }).todoneStore.setSelectedTask(taskId);
      }
    } catch (error) {
      console.warn('Could not select task:', error);
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Instance method for permission status
  getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Static utility methods
  static async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  static isSupported(): boolean {
    return 'Notification' in window;
  }

  // Cleanup
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
    this.notifications = [];
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
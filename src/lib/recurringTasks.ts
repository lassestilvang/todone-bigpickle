import type { Task, RecurringPattern } from '../types';

export class RecurringTaskService {
  /**
   * Calculate the next occurrence date for a recurring task
   */
  static getNextOccurrence(
    task: Task,
    fromDate: Date = new Date()
  ): Date | null {
    if (!task.recurringPattern || !task.dueDate) {
      return null;
    }

    const pattern = task.recurringPattern;
    const baseDate = new Date(task.dueDate);
    const nextDate = new Date(fromDate);

    // Set the time from the original task
    nextDate.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);

    switch (pattern.type) {
      case 'daily':
        return this.addDays(nextDate, pattern.interval);

      case 'weekly':
        return this.addWeeks(nextDate, pattern.interval, pattern.daysOfWeek);

      case 'monthly':
        return this.addMonths(nextDate, pattern.interval, pattern.dayOfMonth);

      case 'yearly':
        return this.addYears(nextDate, pattern.interval);

      case 'custom':
        // For custom patterns, default to daily behavior
        return this.addDays(nextDate, pattern.interval);

      default:
        return null;
    }
  }

  /**
   * Generate all future occurrences of a recurring task
   */
  static generateFutureOccurrences(
    task: Task,
    maxOccurrences: number = 100
  ): Task[] {
    if (!task.recurringPattern || !task.dueDate) {
      return [];
    }

    const occurrences: Task[] = [];
    let currentDate = new Date(task.dueDate);
    let count = 0;

    while (count < maxOccurrences) {
      const nextDate = this.getNextOccurrence(
        { ...task, dueDate: currentDate },
        currentDate
      );

      if (!nextDate) break;

      // Check end conditions
      if (task.recurringPattern.endDate && nextDate > task.recurringPattern.endDate) {
        break;
      }

      if (task.recurringPattern.count && count >= task.recurringPattern.count) {
        break;
      }

      // Create the next occurrence
      const nextTask: Task = {
        ...task,
        id: `${task.id}-occurrence-${Date.now()}-${count}`,
        dueDate: nextDate,
        completedAt: undefined,
        isCompleted: false,
        order: task.order + count + 1,
        updatedAt: new Date(),
      };

      occurrences.push(nextTask);
      currentDate = nextDate;
      count++;
    }

    return occurrences;
  }

  /**
   * Check if a recurring task should create a new occurrence
   */
  static shouldCreateNextOccurrence(task: Task): boolean {
    if (!task.recurringPattern || !task.isCompleted || !task.completedAt) {
      return false;
    }

    // Don't create if there's an end date and we've passed it
    if (task.recurringPattern.endDate && task.completedAt > task.recurringPattern.endDate) {
      return false;
    }

    // Don't create if we've reached the count limit
    if (task.recurringPattern.count) {
      // This would need to be tracked separately in a real implementation
      // For now, we'll assume we haven't reached the limit
    }

    return true;
  }

  /**
   * Create the next occurrence of a completed recurring task
   */
  static createNextOccurrence(task: Task): Task | null {
    if (!this.shouldCreateNextOccurrence(task)) {
      return null;
    }

    const nextDate = this.getNextOccurrence(task);
    if (!nextDate) {
      return null;
    }

    return {
      ...task,
      id: `${task.id}-next-${Date.now()}`,
      dueDate: nextDate,
      completedAt: undefined,
      isCompleted: false,
      order: task.order + 1,
      updatedAt: new Date(),
    };
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private static addWeeks(
    date: Date,
    weeks: number,
    daysOfWeek?: number[]
  ): Date {
    const result = new Date(date);
    
    if (!daysOfWeek || daysOfWeek.length === 0) {
      // Default to same day of week
      result.setDate(result.getDate() + (weeks * 7));
      return result;
    }

    // Find the next specified day of week
    const currentDay = result.getDay();
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    
    // Find the next day in the current week
    let nextDay = sortedDays.find(day => day > currentDay);
    
    if (nextDay === undefined) {
      // No more days this week, go to next week
      nextDay = sortedDays[0];
      result.setDate(result.getDate() + ((7 - currentDay) + nextDay) + ((weeks - 1) * 7));
    } else {
      result.setDate(result.getDate() + (nextDay - currentDay) + ((weeks - 1) * 7));
    }

    return result;
  }

  private static addMonths(
    date: Date,
    months: number,
    dayOfMonth?: number
  ): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    
    if (dayOfMonth) {
      result.setDate(dayOfMonth);
    }

    // Handle edge cases like February 30th
    const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    if (result.getDate() > lastDayOfMonth) {
      result.setDate(lastDayOfMonth);
    }

    return result;
  }

  private static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Get a human-readable description of a recurring pattern
   */
  static getPatternDescription(pattern: RecurringPattern): string {
    const { type, interval, daysOfWeek, dayOfMonth, endDate, count } = pattern;

    let description = '';

    if (interval === 1) {
      description += type;
    } else {
      description += `every ${interval} ${type}s`;
    }

    if (type === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
      description += ` on ${selectedDays}`;
    }

    if (type === 'monthly' && dayOfMonth) {
      description += ` on day ${dayOfMonth}`;
    }

    if (endDate) {
      description += ` until ${endDate.toLocaleDateString()}`;
    }

    if (count) {
      description += ` (${count} times)`;
    }

    return description;
  }

  /**
   * Validate a recurring pattern
   */
  static validatePattern(pattern: RecurringPattern): string[] {
    const errors: string[] = [];

    if (pattern.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    if (pattern.type === 'weekly' && (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0)) {
      errors.push('Weekly recurrence must specify at least one day of the week');
    }

    if (pattern.type === 'monthly' && (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31)) {
      errors.push('Monthly recurrence must specify a valid day of the month (1-31)');
    }

    if (pattern.endDate && pattern.endDate <= new Date()) {
      errors.push('End date must be in the future');
    }

    if (pattern.count && pattern.count < 1) {
      errors.push('Count must be at least 1');
    }

    return errors;
  }
}
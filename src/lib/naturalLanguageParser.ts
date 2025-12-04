import type { RecurringPattern, Priority } from '../types';

export interface ParsedTask {
  content: string;
  description?: string;
  dueDate?: Date;
  dueTime?: string;
  priority?: Priority;
  labels?: string[];
  recurringPattern?: RecurringPattern;
  projectId?: string;
  duration?: number;
}

export class NaturalLanguageParser {
  private static readonly DATE_PATTERNS = [
    // Today, tomorrow, yesterday
    { pattern: /\b(today|tod|now)\b/i, handler: () => new Date() },
    { pattern: /\b(tomorrow|tmrw|tm)\b/i, handler: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }},
    { pattern: /\b(yesterday|yst)\b/i, handler: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }},

    // Days of the week
    { pattern: /\b(monday|mon)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(1) },
    { pattern: /\b(tuesday|tue|tues)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(2) },
    { pattern: /\b(wednesday|wed)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(3) },
    { pattern: /\b(thursday|thu|thurs)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(4) },
    { pattern: /\b(friday|fri)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(5) },
    { pattern: /\b(saturday|sat)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(6) },
    { pattern: /\b(sunday|sun)\b/i, handler: () => NaturalLanguageParser.getNextDayOfWeek(0) },

    // Relative dates
    { pattern: /\b(in (\d+) days?)\b/i, handler: (_, days) => {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(days));
      return date;
    }},
    { pattern: /\b(in (\d+) weeks?)\b/i, handler: (_, weeks) => {
      const date = new Date();
      date.setDate(date.getDate() + (parseInt(weeks) * 7));
      return date;
    }},
    { pattern: /\b(in (\d+) months?)\b/i, handler: (_, months) => {
      const date = new Date();
      date.setMonth(date.getMonth() + parseInt(months));
      return date;
    }},
    { pattern: /\b(next week)\b/i, handler: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }},
    { pattern: /\b(next month)\b/i, handler: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }},

    // Specific dates
    { pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, handler: (_, month, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? (year.length === 2 ? 2000 + parseInt(year) : parseInt(year)) : currentYear;
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }},
    { pattern: /\b(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\b/g, handler: (_, month, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? (year.length === 2 ? 2000 + parseInt(year) : parseInt(year)) : currentYear;
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }},

    // Month names
    { pattern: /\b(january|jan)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 0, parseInt(day));
    }},
    { pattern: /\b(february|feb)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 1, parseInt(day));
    }},
    { pattern: /\b(march|mar)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 2, parseInt(day));
    }},
    { pattern: /\b(april|apr)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 3, parseInt(day));
    }},
    { pattern: /\b(may)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 4, parseInt(day));
    }},
    { pattern: /\b(june|jun)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 5, parseInt(day));
    }},
    { pattern: /\b(july|jul)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 6, parseInt(day));
    }},
    { pattern: /\b(august|aug)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 7, parseInt(day));
    }},
    { pattern: /\b(september|sep|sept)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 8, parseInt(day));
    }},
    { pattern: /\b(october|oct)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 9, parseInt(day));
    }},
    { pattern: /\b(november|nov)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 10, parseInt(day));
    }},
    { pattern: /\b(december|dec)\s+(\d{1,2})(?:\s+(\d{4}))?\b/i, handler: (_, day, year) => {
      const currentYear = new Date().getFullYear();
      const fullYear = year ? parseInt(year) : currentYear;
      return new Date(fullYear, 11, parseInt(day));
    }},
  ];

  private static readonly TIME_PATTERNS = [
    { pattern: /\b(at|@)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i, handler: (_, hour, minute, period) => {
      const h = parseInt(hour);
      const m = minute ? parseInt(minute) : 0;
      const p = period?.toLowerCase();
      
      if (p === 'pm' && h < 12) return `${h + 12}:${m.toString().padStart(2, '0')}`;
      if (p === 'am' && h === 12) return `00:${m.toString().padStart(2, '0')}`;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }},
    { pattern: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i, handler: (_, hour, minute, period) => {
      const h = parseInt(hour);
      const m = minute ? parseInt(minute) : 0;
      const p = period?.toLowerCase();
      
      if (p === 'pm' && h < 12) return `${h + 12}:${m.toString().padStart(2, '0')}`;
      if (p === 'am' && h === 12) return `00:${m.toString().padStart(2, '0')}`;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }},
  ];

  private static readonly PRIORITY_PATTERNS = [
    { pattern: /\b(p1|priority\s*1|urgent|asap|critical)\b/i, priority: 'p1' as Priority },
    { pattern: /\b(p2|priority\s*2|high|important)\b/i, priority: 'p2' as Priority },
    { pattern: /\b(p3|priority\s*3|medium|normal)\b/i, priority: 'p3' as Priority },
    { pattern: /\b(p4|priority\s*4|low|later|sometime)\b/i, priority: 'p4' as Priority },
  ];

  private static readonly RECURRING_PATTERNS = [
    { pattern: /\b(every|daily|each)\s+day\b/i, handler: () => ({ type: 'daily' as const, interval: 1 }) },
    { pattern: /\b(every|each)\s+week\b/i, handler: () => ({ type: 'weekly' as const, interval: 1 }) },
    { pattern: /\b(every|each)\s+month\b/i, handler: () => ({ type: 'monthly' as const, interval: 1 }) },
    { pattern: /\b(every|each)\s+year\b/i, handler: () => ({ type: 'yearly' as const, interval: 1 }) },
    { pattern: /\b(every|each)\s+(\d+)\s+days?\b/i, handler: (_, interval) => ({ type: 'daily' as const, interval: parseInt(interval) }) },
    { pattern: /\b(every|each)\s+(\d+)\s+weeks?\b/i, handler: (_, interval) => ({ type: 'weekly' as const, interval: parseInt(interval) }) },
    { pattern: /\b(every|each)\s+(\d+)\s+months?\b/i, handler: (_, interval) => ({ type: 'monthly' as const, interval: parseInt(interval) }) },
    { pattern: /\b(every|each)\s+(\d+)\s+years?\b/i, handler: (_, interval) => ({ type: 'yearly' as const, interval: parseInt(interval) }) },
    { pattern: /\b(weekly|weekly)\b/i, handler: () => ({ type: 'weekly' as const, interval: 1 }) },
    { pattern: /\b(monthly|monthly)\b/i, handler: () => ({ type: 'monthly' as const, interval: 1 }) },
    { pattern: /\b(yearly|annually|annual)\b/i, handler: () => ({ type: 'yearly' as const, interval: 1 }) },
  ];

  private static readonly DURATION_PATTERNS = [
    { pattern: /\b(for\s+)?(\d+)\s+(minutes?|mins?|min)\b/i, handler: (_, minutes) => parseInt(minutes) },
    { pattern: /\b(for\s+)?(\d+)\s+(hours?|hrs?|hr)\b/i, handler: (_, hours) => parseInt(hours) * 60 },
    { pattern: /\b(for\s+)?(\d+)\s+(days?)\b/i, handler: (_, days) => parseInt(days) * 24 * 60 },
  ];

  private static readonly LABEL_PATTERNS = [
    { pattern: /#(\w+)/g, handler: (match) => match.slice(1) },
    { pattern: /\+(w+)/g, handler: (match) => match.slice(1) },
  ];

  private static readonly PROJECT_PATTERNS = [
    { pattern: /@(\w+)/g, handler: (match) => match.slice(1) },
  ];

  /**
   * Parse natural language input into a structured task
   */
  static parse(input: string): ParsedTask {
    const result: ParsedTask = {
      content: input,
    };

    let cleanedInput = input;

    // Extract and remove labels
    const labels: string[] = [];
    cleanedInput = cleanedInput.replace(this.LABEL_PATTERNS[0].pattern, (match) => {
      labels.push(match.slice(1));
      return '';
    });
    cleanedInput = cleanedInput.replace(this.LABEL_PATTERNS[1].pattern, (match) => {
      labels.push(match.slice(1));
      return '';
    });

    // Extract and remove project
    const projectMatch = cleanedInput.match(this.PROJECT_PATTERNS[0].pattern);
    if (projectMatch) {
      result.projectId = projectMatch[0].slice(1);
      cleanedInput = cleanedInput.replace(this.PROJECT_PATTERNS[0].pattern, '');
    }

    // Extract priority
    for (const { pattern, priority } of this.PRIORITY_PATTERNS) {
      if (pattern.test(cleanedInput)) {
        result.priority = priority;
        cleanedInput = cleanedInput.replace(pattern, '');
        break;
      }
    }

    // Extract due date
    for (const { pattern, handler } of this.DATE_PATTERNS) {
      const match = cleanedInput.match(pattern);
      if (match) {
        result.dueDate = handler.apply(null, match);
        cleanedInput = cleanedInput.replace(pattern, '');
        break;
      }
    }

    // Extract due time
    for (const { pattern, handler } of this.TIME_PATTERNS) {
      const match = cleanedInput.match(pattern);
      if (match) {
        result.dueTime = handler.apply(null, match);
        cleanedInput = cleanedInput.replace(pattern, '');
        break;
      }
    }

    // Extract recurring pattern
    for (const { pattern, handler } of this.RECURRING_PATTERNS) {
      const match = cleanedInput.match(pattern);
      if (match) {
        result.recurringPattern = handler.apply(null, match);
        cleanedInput = cleanedInput.replace(pattern, '');
        break;
      }
    }

    // Extract duration
    for (const { pattern, handler } of this.DURATION_PATTERNS) {
      const match = cleanedInput.match(pattern);
      if (match) {
        result.duration = handler.apply(null, match);
        cleanedInput = cleanedInput.replace(pattern, '');
        break;
      }
    }

    // Clean up the content
    result.content = cleanedInput.trim().replace(/\s+/g, ' ');
    
    // Extract description (anything after a colon or dash)
    const descMatch = result.content.match(/[:|-]\s*(.+)$/);
    if (descMatch) {
      result.description = descMatch[1].trim();
      result.content = result.content.replace(/[:|-]\s*.+$/, '').trim();
    }

    // Add labels if found
    if (labels.length > 0) {
      result.labels = labels;
    }

    return result;
  }

  /**
   * Get suggestions for natural language input
   */
  static getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase();

    // Date suggestions
    if (lowerInput.includes('today') || lowerInput.includes('tod')) {
      suggestions.push('today');
    }
    if (lowerInput.includes('tomorrow') || lowerInput.includes('tmrw')) {
      suggestions.push('tomorrow');
    }
    if (lowerInput.includes('next')) {
      suggestions.push('next week', 'next month');
    }

    // Priority suggestions
    if (lowerInput.includes('p') || lowerInput.includes('priority')) {
      suggestions.push('p1 urgent', 'p2 high', 'p3 medium', 'p4 low');
    }

    // Time suggestions
    if (lowerInput.includes('at') || lowerInput.includes('@')) {
      suggestions.push('at 9am', 'at 2pm', 'at 5:30pm');
    }

    // Recurring suggestions
    if (lowerInput.includes('every') || lowerInput.includes('daily')) {
      suggestions.push('every day', 'every week', 'every month');
    }

    // Label suggestions
    if (lowerInput.includes('#')) {
      suggestions.push('#work #urgent', '#personal #shopping');
    }

    // Project suggestions
    if (lowerInput.includes('@')) {
      suggestions.push('@work @home @personal');
    }

    return suggestions;
  }

  /**
   * Format a parsed task back to natural language
   */
  static formatToNaturalLanguage(task: ParsedTask): string {
    let result = task.content;

    if (task.priority) {
      result = `${task.priority} ${result}`;
    }

    if (task.dueDate) {
      const dateStr = task.dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      result += ` ${dateStr}`;
    }

    if (task.dueTime) {
      result += ` at ${task.dueTime}`;
    }

    if (task.labels && task.labels.length > 0) {
      result += ' ' + task.labels.map(label => `#${label}`).join(' ');
    }

    if (task.projectId) {
      result += ` @${task.projectId}`;
    }

    if (task.recurringPattern) {
      const pattern = task.recurringPattern;
      if (pattern.interval === 1) {
        result += ` ${pattern.type}`;
      } else {
        result += ` every ${pattern.interval} ${pattern.type}s`;
      }
    }

    return result;
  }

  private static getNextDayOfWeek(dayOfWeek: number): Date {
    const date = new Date();
    const currentDay = date.getDay();
    const daysUntilNext = dayOfWeek >= currentDay ? dayOfWeek - currentDay : 7 - (currentDay - dayOfWeek);
    date.setDate(date.getDate() + daysUntilNext);
    return date;
  }
}
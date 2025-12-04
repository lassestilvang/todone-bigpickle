import type { Task, RecurringPattern } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  taskId?: string;
  calendarId: string;
  source: 'google' | 'outlook' | 'local';
  recurrence?: {
    rule: string;
    timezone?: string;
  };
  created: Date;
  updated: Date;
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  source: 'google' | 'outlook' | 'local';
  isPrimary: boolean;
  isWritable: boolean;
  timezone: string;
  accessToken?: string;
  refreshToken?: string;
  syncToken?: string;
  lastSyncAt?: Date;
  syncEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncSettings {
  bidirectionalSync: boolean;
  syncCompletedTasks: boolean;
  syncWindow: number; // Days to sync (past and future)
  defaultCalendarId?: string;
  autoCreateEvents: boolean;
  updateExistingEvents: boolean;
  syncInterval: number; // Minutes
  includeLabels: boolean;
  includeProjects: boolean;
}

export interface SyncConflict {
  id: string;
  type: 'event_task_mismatch' | 'time_conflict' | 'duplicate_event' | 'data_conflict';
  calendarEvent: CalendarEvent;
  task: Task;
  description: string;
  resolution?: 'keep_task' | 'keep_event' | 'merge' | 'manual';
  createdAt: Date;
}

export interface CalendarSyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  tasksCreated: number;
  tasksUpdated: number;
  conflicts: SyncConflict[];
  errors: string[];
  syncTime: Date;
}

export class CalendarIntegration {
  private static instance: CalendarIntegration;
  private calendars: Calendar[] = [];
  private events: CalendarEvent[] = [];
  private syncSettings: SyncSettings;
  private syncIntervalId?: number;

  private constructor() {
    this.syncSettings = this.getDefaultSyncSettings();
    this.initializeLocalCalendar();
  }

  static getInstance(): CalendarIntegration {
    if (!CalendarIntegration.instance) {
      CalendarIntegration.instance = new CalendarIntegration();
    }
    return CalendarIntegration.instance;
  }

  /**
   * Get default sync settings
   */
  private getDefaultSyncSettings(): SyncSettings {
    return {
      bidirectionalSync: true,
      syncCompletedTasks: false,
      syncWindow: 30, // 30 days past and future
      autoCreateEvents: true,
      updateExistingEvents: true,
      syncInterval: 15, // 15 minutes
      includeLabels: true,
      includeProjects: true
    };
  }

  /**
   * Initialize local calendar
   */
  private initializeLocalCalendar(): void {
    const localCalendar: Calendar = {
      id: 'local-calendar',
      name: 'Todone Calendar',
      description: 'Local calendar for Todone tasks',
      color: '#10b981',
      source: 'local',
      isPrimary: true,
      isWritable: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      syncEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.calendars.push(localCalendar);
  }

  /**
   * Connect to Google Calendar
   */
  async connectGoogleCalendar(accessToken: string, refreshToken?: string): Promise<Calendar[]> {
    try {
      // In a real implementation, this would use Google Calendar API
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google Calendar list');
      }

      const data = await response.json();
      const googleCalendars: Calendar[] = data.items.map((cal: Record<string, unknown>) => ({
        id: cal.id,
        name: cal.summary,
        description: cal.description,
        color: cal.backgroundColor || '#3b82f6',
        source: 'google' as const,
        isPrimary: cal.primary || false,
        isWritable: cal.accessRole === 'writer' || cal.accessRole === 'owner',
        timezone: cal.timeZone,
        accessToken,
        refreshToken,
        syncEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Add to calendars list
      this.calendars.push(...googleCalendars);

      return googleCalendars;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Connect to Outlook Calendar
   */
  async connectOutlookCalendar(accessToken: string, refreshToken?: string): Promise<Calendar[]> {
    try {
      // In a real implementation, this would use Microsoft Graph API
      const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Outlook Calendar list');
      }

      const data = await response.json();
      const outlookCalendars: Calendar[] = data.value.map((cal: Record<string, unknown>) => ({
        id: cal.id,
        name: cal.name,
        color: cal.color || '#8b5cf6',
        source: 'outlook' as const,
        isPrimary: cal.isDefaultCalendar || false,
        isWritable: true, // Assume writable for user's own calendars
        timezone: cal.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        accessToken,
        refreshToken,
        syncEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Add to calendars list
      this.calendars.push(...outlookCalendars);

      return outlookCalendars;
    } catch (error) {
      console.error('Error connecting to Outlook Calendar:', error);
      throw error;
    }
  }

  /**
   * Sync tasks to calendar events
   */
  async syncTasksToCalendar(tasks: Task[], calendarId?: string): Promise<CalendarSyncResult> {
    const targetCalendarId = calendarId || this.syncSettings.defaultCalendarId || 'local-calendar';
    const calendar = this.calendars.find(cal => cal.id === targetCalendarId);
    
    if (!calendar) {
      throw new Error(`Calendar not found: ${targetCalendarId}`);
    }

    const result: CalendarSyncResult = {
      success: true,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      tasksCreated: 0,
      tasksUpdated: 0,
      conflicts: [],
      errors: [],
      syncTime: new Date()
    };

    try {
      // Get existing events for the sync window
      const existingEvents = await this.getEventsForCalendar(targetCalendarId);
      const syncStartDate = new Date();
      syncStartDate.setDate(syncStartDate.getDate() - this.syncSettings.syncWindow);
      const syncEndDate = new Date();
      syncEndDate.setDate(syncEndDate.getDate() + this.syncSettings.syncWindow);

      // Filter tasks within sync window
      const tasksToSync = tasks.filter(task => 
        task.dueDate && 
        task.dueDate >= syncStartDate && 
        task.dueDate <= syncEndDate &&
        (this.syncSettings.syncCompletedTasks || !task.isCompleted)
      );

      // Sync each task
      for (const task of tasksToSync) {
        try {
          const existingEvent = existingEvents.find(event => event.taskId === task.id);
          
          if (existingEvent) {
            // Update existing event
            if (this.syncSettings.updateExistingEvents) {
              await this.updateCalendarEvent(existingEvent.id, task, calendar);
              result.eventsUpdated++;
            }
          } else {
            // Create new event
            if (this.syncSettings.autoCreateEvents) {
              await this.createCalendarEvent(task, calendar);
              result.eventsCreated++;
            }
          }
        } catch (error) {
          result.errors.push(`Failed to sync task ${task.id}: ${error}`);
        }
      }

      // Handle bidirectional sync
      if (this.syncSettings.bidirectionalSync) {
        await this.syncCalendarEventsToTasks(calendar, tasks, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    return result;
  }

  /**
   * Create calendar event from task
   */
  private async createCalendarEvent(task: Task, calendar: Calendar): Promise<CalendarEvent> {
    const event: CalendarEvent = {
      id: `event-${task.id}-${Date.now()}`,
      title: task.content,
      description: this.createEventDescription(task),
      startTime: this.calculateEventStartTime(task),
      endTime: this.calculateEventEndTime(task),
      allDay: !task.dueTime,
      taskId: task.id,
      calendarId: calendar.id,
      source: calendar.source,
      created: new Date(),
      updated: new Date()
    };

    // Add recurrence if task is recurring
    if (task.recurringPattern) {
      event.recurrence = {
        rule: this.convertRecurringPatternToRRule(task.recurringPattern),
        timezone: calendar.timezone
      };
    }

    // Save event based on source
    if (calendar.source === 'local') {
      this.events.push(event);
    } else {
      await this.saveEventToExternalCalendar(event, calendar);
    }

    return event;
  }

  /**
   * Update existing calendar event
   */
  private async updateCalendarEvent(eventId: string, task: Task, calendar: Calendar): Promise<void> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    
    if (eventIndex >= 0) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        title: task.content,
        description: this.createEventDescription(task),
        startTime: this.calculateEventStartTime(task),
        endTime: this.calculateEventEndTime(task),
        allDay: !task.dueTime,
        updated: new Date()
      };
    }

    if (calendar.source !== 'local') {
      await this.updateEventInExternalCalendar(eventId, task, calendar);
    }
  }

  /**
   * Sync calendar events to tasks (bidirectional sync)
   */
  private async syncCalendarEventsToTasks(
    calendar: Calendar, 
    tasks: Task[], 
    result: CalendarSyncResult
  ): Promise<void> {
    const events = await this.getEventsForCalendar(calendar.id);
    
    for (const event of events) {
      // Skip events that were created from tasks
      if (event.taskId) continue;

      // Check if a task already exists for this event
      const existingTask = tasks.find(task => 
        task.content === event.title && 
        task.dueDate?.toDateString() === event.startTime.toDateString()
      );

      if (!existingTask) {
        // Create a task from the calendar event
        // In a real implementation, this would call the task creation API
        result.tasksCreated++;

        // In a real implementation, this would call the task creation API
        result.tasksCreated++;
      }
    }
  }

  /**
   * Get events for a calendar
   */
  private async getEventsForCalendar(calendarId: string): Promise<CalendarEvent[]> {
    const calendar = this.calendars.find(cal => cal.id === calendarId);
    
    if (!calendar) {
      throw new Error(`Calendar not found: ${calendarId}`);
    }

    if (calendar.source === 'local') {
      return this.events.filter(event => event.calendarId === calendarId);
    } else {
      return await this.fetchEventsFromExternalCalendar(calendar);
    }
  }

  /**
   * Create event description from task
   */
  private createEventDescription(task: Task): string {
    let description = '';

    if (task.description) {
      description += `Description: ${task.description}\n\n`;
    }

    if (this.syncSettings.includeProjects && task.projectId) {
      description += `Project: ${task.projectId}\n`;
    }

    if (this.syncSettings.includeLabels && task.labels.length > 0) {
      description += `Labels: ${task.labels.join(', ')}\n`;
    }

    if (task.priority !== 'p4') {
      description += `Priority: ${task.priority.toUpperCase()}\n`;
    }

    description += `\nCreated from Todone task`;

    return description;
  }

  /**
   * Calculate event start time from task
   */
  private calculateEventStartTime(task: Task): Date {
    if (!task.dueDate) {
      return new Date();
    }

    const startTime = new Date(task.dueDate);
    
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
    } else if (task.duration) {
      // If task has duration, start before due time
      startTime.setMinutes(startTime.getMinutes() - task.duration);
    } else {
      // Default to 9 AM for all-day events
      startTime.setHours(9, 0, 0, 0);
    }

    return startTime;
  }

  /**
   * Calculate event end time from task
   */
  private calculateEventEndTime(task: Task): Date {
    const startTime = this.calculateEventStartTime(task);
    
    if (task.duration) {
      return new Date(startTime.getTime() + task.duration * 60 * 1000);
    } else {
      // Default to 1 hour duration
      return new Date(startTime.getTime() + 60 * 60 * 1000);
    }
  }

  /**
   * Convert recurring pattern to iCalendar RRULE format
   */
  private convertRecurringPatternToRRule(pattern: RecurringPattern): string {
    const freq = pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1);
    let rrule = `FREQ=${freq}`;

    if (pattern.interval > 1) {
      rrule += `;INTERVAL=${pattern.interval}`;
    }

    if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const dayList = pattern.daysOfWeek.map(day => days[day]).join(',');
      rrule += `;BYDAY=${dayList}`;
    }

    if (pattern.endDate) {
      rrule += `;UNTIL=${pattern.endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    }

    if (pattern.count) {
      rrule += `;COUNT=${pattern.count}`;
    }

    return rrule;
  }

  /**
   * External calendar API methods (simplified for demo)
   */
  private async saveEventToExternalCalendar(_event: CalendarEvent, _calendar: Calendar): Promise<void> {
    // In a real implementation, this would call Google Calendar API or Microsoft Graph API
    console.log(`Saving event to ${_calendar.source} calendar ${_calendar.id}`);
  }

  private async updateEventInExternalCalendar(_eventId: string, _task: Task, _calendar: Calendar): Promise<void> {
    // In a real implementation, this would call Google Calendar API or Microsoft Graph API
    console.log(`Updating event in ${_calendar.source} calendar ${_calendar.id}`);
  }

  private async fetchEventsFromExternalCalendar(_calendar: Calendar): Promise<CalendarEvent[]> {
    // In a real implementation, this would call Google Calendar API or Microsoft Graph API
    console.log(`Fetching events from ${_calendar.source} calendar ${_calendar.id}`);
    return [];
  }

  /**
   * Start automatic sync
   */
  startAutoSync(tasks: Task[]): void {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = window.setInterval(async () => {
      try {
        await this.syncTasksToCalendar(tasks);
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, this.syncSettings.syncInterval * 60 * 1000);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = undefined;
    }
  }

  /**
   * Public API methods
   */
  getCalendars(): Calendar[] {
    return [...this.calendars];
  }

  getCalendar(id: string): Calendar | undefined {
    return this.calendars.find(cal => cal.id === id);
  }

  updateSyncSettings(settings: Partial<SyncSettings>): void {
    this.syncSettings = { ...this.syncSettings, ...settings };
  }

  getSyncSettings(): SyncSettings {
    return { ...this.syncSettings };
  }

  getEvents(): CalendarEvent[] {
    return [...this.events];
  }

  disconnectCalendar(calendarId: string): boolean {
    const initialLength = this.calendars.length;
    this.calendars = this.calendars.filter(cal => cal.id !== calendarId);
    this.events = this.events.filter(event => event.calendarId !== calendarId);
    return this.calendars.length < initialLength;
  }

  exportToICalendar(events: CalendarEvent[]): string {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Todone//Calendar Export//EN\n';

    for (const event of events) {
      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${event.id}\n`;
      ical += `DTSTART:${event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += `DTEND:${event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += `SUMMARY:${event.title}\n`;
      if (event.description) {
        ical += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
      }
      if (event.recurrence) {
        ical += `RRULE:${event.recurrence.rule}\n`;
      }
      ical += `CREATED:${event.created.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += `LAST-MODIFIED:${event.updated.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += 'END:VEVENT\n';
    }

    ical += 'END:VCALENDAR';
    return ical;
  }
}
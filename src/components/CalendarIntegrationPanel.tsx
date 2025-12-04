import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import type { Calendar as CalendarType, CalendarEvent } from '../lib/calendarIntegration';
import { useAppStore } from '../store/appStore';
import { CalendarIntegration } from '../lib/calendarIntegration';

export const CalendarIntegrationPanel: React.FC = () => {
  const { tasks } = useAppStore();
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const calendarIntegration = CalendarIntegration.getInstance();

  useEffect(() => {
    setCalendars(calendarIntegration.getCalendars());
    setEvents(calendarIntegration.getEvents());
  }, [calendarIntegration]);

  const handleSync = async (calendarId?: string) => {
    setIsSyncing(true);
    try {
      const result = await calendarIntegration.syncTasksToCalendar(tasks, calendarId);
      setCalendars(calendarIntegration.getCalendars());
      setEvents(calendarIntegration.getEvents());
      
      if (result.success) {
        alert(`Sync completed: ${result.eventsCreated} events created, ${result.eventsUpdated} updated`);
      } else {
        alert(`Sync completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const getSourceIcon = (source: CalendarType['source']) => {
    switch (source) {
      case 'google': return '📅';
      case 'outlook': return '📆';
      case 'local': return '📋';
      default: return '📅';
    }
  };

  const primaryCalendar = calendars.find(cal => cal.isPrimary);
  const connectedCalendars = calendars.filter(cal => cal.source !== 'local');
  const activeCalendars = calendars.filter(cal => cal.syncEnabled);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">Calendar Integration</h3>
            {connectedCalendars.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {connectedCalendars.length} connected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeCalendars.length}</div>
            <div className="text-xs text-gray-500">Active Calendars</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{events.length}</div>
            <div className="text-xs text-gray-500">Synced Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.dueDate).length}
            </div>
            <div className="text-xs text-gray-500">Tasks with Due Dates</div>
          </div>
        </div>

        {/* Primary Calendar Actions */}
        {primaryCalendar && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSourceIcon(primaryCalendar.source)}</span>
                <div>
                  <div className="font-medium text-gray-900">{primaryCalendar.name}</div>
                  <div className="text-xs text-gray-600">Primary Calendar</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleSync(primaryCalendar.id)}
              disabled={isSyncing}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {/* Connected Calendars */}
        {connectedCalendars.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Connected Calendars</h4>
            <div className="space-y-2">
              {connectedCalendars.map(calendar => (
                <div
                  key={calendar.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSourceIcon(calendar.source)}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {calendar.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {calendar.source.charAt(0).toUpperCase() + calendar.source.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
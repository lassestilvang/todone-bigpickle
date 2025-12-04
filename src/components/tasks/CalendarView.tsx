import React, { useState, useMemo } from 'react';
import type { Task } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  title: string;
  emptyMessage?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  title,
  emptyMessage = 'No tasks to display'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCompleted, setFilterCompleted] = useState<boolean>(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterCompleted !== undefined && task.isCompleted !== filterCompleted) return false;
      return true;
    });
  }, [tasks, filterPriority, filterCompleted]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    filteredTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(task.dueDate, 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  const getTasksForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1': return 'bg-red-100 text-red-700 border-red-200';
      case 'p2': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'p3': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const exportCalendar = () => {
    // Create iCal format
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Todone//Task Calendar//EN\n';
    
    filteredTasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const startDate = new Date(dueDate);
        startDate.setHours(9, 0, 0, 0); // Default to 9 AM
        
        const endDate = new Date(dueDate);
        endDate.setHours(10, 0, 0, 0); // 1 hour duration
        
        icalContent += 'BEGIN:VEVENT\n';
        icalContent += `DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss'Z'")}\n`;
        icalContent += `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}\n`;
        icalContent += `SUMMARY:${task.content}\n`;
        if (task.description) {
          icalContent += `DESCRIPTION:${task.description}\n`;
        }
        icalContent += `PRIORITY:${task.priority === 'p1' ? '1' : task.priority === 'p2' ? '5' : '9'}\n`;
        icalContent += `UID:${task.id}@todone.app\n`;
        icalContent += 'END:VEVENT\n';
      }
    });
    
    icalContent += 'END:VCALENDAR';
    
    // Download file
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todone-tasks.ics';
    a.click();
    URL.revokeObjectURL(url);
  };



  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} {viewMode}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md transition-colors ${
                  showFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Filter tasks"
              >
                <Filter className="h-5 w-5" />
              </button>
              
              <button
                onClick={exportCalendar}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Export to calendar"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Today
              </button>
              
              <div className="text-lg font-medium text-gray-900 min-w-[150px] text-center">
                {format(currentMonth, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All</option>
                  <option value="p1">P1 - Urgent</option>
                  <option value="p2">P2 - High</option>
                  <option value="p3">P3 - Medium</option>
                  <option value="p4">P4 - Low</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filterCompleted ? 'completed' : 'active'}
                  onChange={(e) => setFilterCompleted(e.target.value === 'completed')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-6">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyMessage}
              </h3>
              <p className="text-sm">
                Try adjusting your filters or create new tasks
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-700"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-white min-h-[100px]"
                />
              ))}

              {/* Month days */}
              {monthDays.map(day => {
                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      bg-white min-h-[100px] p-2 cursor-pointer hover:bg-gray-50
                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${isToday ? 'bg-primary-50' : ''}
                      ${isSelected ? 'ring-2 ring-primary-500' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${
                        isToday ? 'text-primary-600' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Tasks for this day */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task: Task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border truncate ${getPriorityColor(task.priority)}`}
                          title={task.content}
                        >
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              task.isCompleted ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                            <span className={task.isCompleted ? 'line-through' : ''}>
                              {task.content.length > 20 
                                ? `${task.content.substring(0, 20)}...`
                                : task.content
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-gray-500">No tasks for this date</p>
            ) : (
              getTasksForDate(selectedDate).map((task: Task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      task.isCompleted ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className={`text-sm ${task.isCompleted ? 'line-through' : ''}`}>
                      {task.content}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
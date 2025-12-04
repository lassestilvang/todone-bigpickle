import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import { BoardView } from '../tasks/BoardView';
import { CalendarView } from '../tasks/CalendarView';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewModeSelector } from './ViewModeSelector';
import type { Task } from '../../types';

type ViewMode = 'list' | 'board' | 'calendar';

export const UpcomingView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { getUpcomingTasks } = useAppStore();
  const upcomingTasks = getUpcomingTasks(7);

  // Group tasks by date
  const tasksByDate = upcomingTasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    if (task.dueDate) {
      const dateKey = task.dueDate.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, typeof upcomingTasks>);

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming</h2>
            <p className="text-sm text-gray-500 mt-1">
              Next 7 days • {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={setViewMode}
            />
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <div className="text-sm text-gray-600 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {upcomingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming tasks
            </h3>
            <p className="text-sm text-gray-500">
              Take a break and plan for the future
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="p-4">
                {sortedDates.map((dateKey) => {
                  const date = new Date(dateKey);
                  const tasks = tasksByDate[dateKey];
                  
                  return (
                    <div key={dateKey} className="mb-6">
                      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2 border-b border-gray-100">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium text-gray-700">
                          {formatDate(date)}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {tasks.length}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tasks.map((task) => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {viewMode === 'board' && (
              <BoardView
                tasks={upcomingTasks}
                title="Upcoming"
                groupBy="priority"
              />
            )}
            
            {viewMode === 'calendar' && (
              <CalendarView
                tasks={upcomingTasks}
                title="Upcoming"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import { Calendar, AlertCircle } from 'lucide-react';

export const TodayView: React.FC = () => {
  const { getTodayTasks, getOverdueTasks } = useAppStore();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Today</h2>
            <p className="text-sm text-gray-500 mt-1">
              {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'} for today
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <h3 className="font-medium text-red-700">Overdue</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {overdueTasks.length}
              </span>
            </div>
            <div className="space-y-1">
              {overdueTasks.map((task: any) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        <div className="p-4">
          {overdueTasks.length > 0 && todayTasks.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-700">Today</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {todayTasks.length}
              </span>
            </div>
          )}

          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks for today
              </h3>
              <p className="text-sm text-gray-500">
                Enjoy your productive day!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {todayTasks.map((task: any) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
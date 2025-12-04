import React, { memo, useMemo } from 'react';
import { Clock, Calendar, Timer } from 'lucide-react';
import type { Task } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface TaskMetaProps {
  task: Task;
}

export const TaskMeta: React.FC<TaskMetaProps> = memo(({ task }) => {
  const renderDueDate = useMemo(() => {
    if (!task.dueDate) return null;

    const now = new Date();
    const isOverdue = task.dueDate < now && !task.isCompleted;
    const isToday = task.dueDate.toDateString() === now.toDateString();

    return (
      <div className={`flex items-center gap-1 text-xs ${
        isOverdue 
          ? 'text-red-500 dark:text-red-400' 
          : isToday 
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-gray-500 dark:text-gray-400'
      }`}>
        <Calendar className="w-3 h-3" />
        <span>
          {formatDistanceToNow(task.dueDate, { addSuffix: true })}
        </span>
        {task.dueTime && (
          <span className="ml-1">
            at {task.dueTime}
          </span>
        )}
      </div>
    );
  }, [task.dueDate, task.dueTime, task.isCompleted]);

  const renderTimeTracking = useMemo(() => {
    if (!task.timeTracking) return null;

    const { totalTime, isTracking } = task.timeTracking;
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;

    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          <span>
            {hours > 0 && `${hours}h `}{minutes}m
          </span>
        </div>
        {isTracking && (
          <div className="flex items-center gap-1 text-green-500">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Tracking</span>
          </div>
        )}
      </div>
    );
  }, [task.timeTracking]);

  return (
    <div className="flex items-center gap-3 mt-1">
      {renderDueDate}
      {renderTimeTracking}
    </div>
  );
});

TaskMeta.displayName = 'TaskMeta';
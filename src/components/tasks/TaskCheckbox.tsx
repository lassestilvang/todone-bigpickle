import React, { memo, useCallback } from 'react';
import { useAppStore } from '../../store/appStore';
import { Check, Circle } from 'lucide-react';
import type { Task } from '../../types';

interface TaskCheckboxProps {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
}

export const TaskCheckbox: React.FC<TaskCheckboxProps> = memo(({ task, onToggleComplete }) => {
  const toggleTaskComplete = useAppStore(state => state.toggleTaskComplete);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(task.id);
    } else {
      await toggleTaskComplete(task.id);
    }
  }, [task.id, onToggleComplete, toggleTaskComplete]);

  return (
    <button
      onClick={handleToggle}
      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        task.isCompleted
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-gray-300 hover:border-green-500 dark:border-gray-600 dark:hover:border-green-400'
      }`}
      aria-label={task.isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
      aria-pressed={task.isCompleted}
    >
      {task.isCompleted && <Check className="w-3 h-3" />}
      {!task.isCompleted && <Circle className="w-3 h-3 opacity-0 hover:opacity-50" />}
    </button>
  );
});

TaskCheckbox.displayName = 'TaskCheckbox';
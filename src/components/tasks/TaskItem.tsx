import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { Task } from '../../types';
import { 
  Check, 
  Circle, 
  Clock, 
  Calendar, 
  Flag, 
  Tag, 
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Archive
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
  onSelect?: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onSelect 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { updateTask, deleteTask, setSelectedTask } = useAppStore();

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id);
    } else {
      // Use store method
      const { toggleTaskComplete } = useAppStore.getState();
      toggleTaskComplete(task.id);
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(task.id);
    } else {
      setSelectedTask(task.id);
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setIsMenuOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1':
        return 'text-red-500';
      case 'p2':
        return 'text-orange-500';
      case 'p3':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'p1':
        return '!!!';
      case 'p2':
        return '!!';
      case 'p3':
        return '!';
      default:
        return '';
    }
  };

  const formatDueDate = (dueDate: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.isCompleted;

  return (
    <div className={`task-item group ${task.isCompleted ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0"
        title={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.isCompleted ? (
          <Check className="h-5 w-5 text-primary-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        )}
      </button>

      {/* Task Content */}
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={handleSelect}
      >
        <div className="flex items-center gap-2">
          {/* Priority */}
          {task.priority !== 'p4' && (
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
            </span>
          )}

          {/* Task Title */}
          <span className={`text-sm text-gray-900 truncate ${
            task.isCompleted ? 'line-through' : ''
          }`}>
            {task.content}
          </span>
        </div>

        {/* Task Meta */}
        <div className="flex items-center gap-3 mt-1">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-500' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {/* Due Time */}
          {task.dueTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{task.dueTime}</span>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex items-center gap-1">
              {task.labels.slice(0, 3).map((labelId, index) => (
                <span
                  key={labelId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  <Tag className="h-2 w-2" />
                  Label {index + 1}
                </span>
              ))}
              {task.labels.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{task.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Project */}
          {task.projectId && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Project</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleSelect}
          className="p-1 rounded hover:bg-gray-100"
          title="Edit task"
        >
          <Edit2 className="h-4 w-4 text-gray-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded hover:bg-gray-100"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  // Duplicate task
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  // Archive task
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
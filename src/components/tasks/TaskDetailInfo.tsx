import React from 'react';
import type { Task } from '../../types';
import { Calendar, Clock, Flag, Tag, Repeat } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  project?: { id: string; name: string; color: string } | null;
  labels: Array<{ id: string; name: string; color: string }>;
}

export const TaskDetailInfo: React.FC<TaskDetailProps> = ({ task, project, labels }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1':
        return 'text-red-500 bg-red-50';
      case 'p2':
        return 'text-orange-500 bg-orange-50';
      case 'p3':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'p1':
        return 'Priority 1';
      case 'p2':
        return 'Priority 2';
      case 'p3':
        return 'Priority 3';
      default:
        return 'No Priority';
    }
  };

  return (
    <div className="space-y-4">
      {/* Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Priority</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Due Date</span>
          </div>
          <span className="text-sm text-gray-900">
            {task.dueDate.toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      )}

      {/* Due Time */}
      {task.dueTime && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Due Time</span>
          </div>
          <span className="text-sm text-gray-900">{task.dueTime}</span>
        </div>
      )}

      {/* Recurring Pattern */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Repeats</span>
        </div>
        <span className="text-sm text-gray-500">
          {task.recurringPattern ? 'Recurring' : 'Set recurring'}
        </span>
      </div>

      {/* Project */}
      {project && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></div>
            <span className="text-sm text-gray-600">Project</span>
          </div>
          <span className="text-sm text-gray-900">{project.name}</span>
        </div>
      )}

      {/* Labels */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Labels</span>
        </div>
        {task.labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {task.labels.map((labelId) => {
              const label = labels.find((l) => l.id === labelId);
              return label ? (
                <span
                  key={labelId}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></div>
                  {label.name}
                </span>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No labels assigned</p>
        )}
      </div>
    </div>
  );
};
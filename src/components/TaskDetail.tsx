import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

import { 
  X, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Edit2,
  Trash2,
  Archive,
  Copy
} from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  
  const { 
    tasks, 
    projects, 
    labels,
    updateTask, 
    deleteTask,
    setSelectedTask 
  } = useAppStore();

  const task = tasks.find((t: any) => t.id === taskId);
  const project = task?.projectId ? projects.find((p: any) => p.id === task.projectId) : null;

  useEffect(() => {
    if (task) {
      setEditedContent(task.content);
      setEditedDescription(task.description || '');
    }
  }, [task]);

  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p>Task not found</p>
          <button 
            onClick={() => setSelectedTask(null)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateTask(taskId, {
        content: editedContent.trim(),
        description: editedDescription.trim() || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setSelectedTask(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Task Details</h3>
        <button
          onClick={() => setSelectedTask(null)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Task Content */}
        <div>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Task title"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="btn btn-primary px-3 py-1.5 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(task.content);
                    setEditedDescription(task.description || '');
                  }}
                  className="btn btn-secondary px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className={`text-lg font-medium text-gray-900 mb-2 ${
                task.isCompleted ? 'line-through opacity-60' : ''
              }`}>
                {task.content}
              </h2>
              {task.description && (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Task Properties */}
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
          {task.labels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Labels</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((labelId: any) => {
                  const label = labels.find((l: any) => l.id === labelId);
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
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {task.createdAt.toLocaleDateString()}</div>
            <div>Updated: {task.updatedAt.toLocaleDateString()}</div>
            {task.completedAt && (
              <div>Completed: {task.completedAt.toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full btn btn-ghost px-3 py-2 text-sm justify-start">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Task
          </button>
          <button className="w-full btn btn-ghost px-3 py-2 text-sm justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Archive Task
          </button>
          <button 
            onClick={handleDelete}
            className="w-full btn btn-ghost px-3 py-2 text-sm text-red-600 hover:bg-red-50 justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
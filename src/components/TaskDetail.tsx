import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Comments } from './tasks/Comments';
import { TimeTracking } from './tasks/TimeTracking';
import { RecurringTaskScheduler } from './tasks/RecurringTaskScheduler';
import { TaskDetailInfo } from './tasks/TaskDetailInfo';
import { RecurringTaskService } from '../lib/recurringTasks';
import type { RecurringPattern } from '../types';

import { 
  X, 
  Edit2,
  MessageSquare,
  Timer
} from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onClose, showCloseButton = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'time'>('details');
  const [showRecurringScheduler, setShowRecurringScheduler] = useState(false);
  
  const { 
    tasks, 
    projects, 
    labels,
    updateTask, 
    setSelectedTask,
    loadComments,
    getTaskComments,
    setTaskRecurringPattern
  } = useAppStore();

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const task = tasks.find((t) => t.id === taskId);
  const project = task?.projectId ? projects.find((p) => p.id === task.projectId) : null;

  // Reset form when task changes
  const editedValues = useMemo(() => {
    if (!task) {
      return { content: '', description: '', labels: [] };
    }
    return {
      content: task.content,
      description: task.description || '',
      labels: task.labels || []
    };
  }, [task]);

  useEffect(() => {
    setEditedContent(editedValues.content);
    setEditedDescription(editedValues.description);
    setSelectedLabels(editedValues.labels);
  }, [editedValues]);

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
        description: editedDescription.trim() || undefined,
        labels: selectedLabels
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleRecurringPatternSave = async (pattern: RecurringPattern | undefined) => {
    try {
      await setTaskRecurringPattern(taskId, pattern);
      setShowRecurringScheduler(false);
    } catch (error) {
      console.error('Failed to set recurring pattern:', error);
    }
  };





  const commentCount = getTaskComments(taskId).length;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <h3 className="font-medium text-gray-900">Task Details</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'details' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'comments' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              Comments
              {commentCount > 0 && (
                <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                  {commentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'time' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Timer className="h-3 w-3" />
              Time
            </button>
          </div>
        </div>
        <button
          onClick={() => setSelectedTask(null)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'details' ? (
          <div className="p-4 space-y-6">
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

          {/* Label Selection */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Add Labels</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => {
                    if (selectedLabels.includes(label.id)) {
                      setSelectedLabels(selectedLabels.filter(id => id !== label.id));
                    } else {
                      setSelectedLabels([...selectedLabels, label.id]);
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border-2 transition-colors ${
                    selectedLabels.includes(label.id)
                      ? 'border-gray-900 bg-gray-100'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></div>
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Properties */}
        <TaskDetailInfo 
          task={task} 
          project={project}
          labels={labels}
        />
        
        {/* Recurring Pattern Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Recurring Settings</span>
          </div>
          <button
            onClick={() => setShowRecurringScheduler(true)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {task.recurringPattern 
              ? RecurringTaskService.getPatternDescription(task.recurringPattern)
              : 'Set recurring'
            }
          </button>
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
         ) : activeTab === 'comments' ? (
           <Comments taskId={taskId} />
         ) : (
           <TimeTracking task={task} />
         )}
      </div>

      {/* Recurring Task Scheduler Modal */}
      {showRecurringScheduler && (
        <RecurringTaskScheduler
          pattern={task.recurringPattern}
          onSave={handleRecurringPatternSave}
          onCancel={() => setShowRecurringScheduler(false)}
        />
      )}
    </div>
  );
};
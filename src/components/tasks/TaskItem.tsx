import React, { memo, useCallback, useMemo, useState } from 'react';
import { useAppStore } from '../../store/minimalStore';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskMeta } from './TaskMeta';
import { TaskActions } from './TaskActions';
import { ErrorBoundary } from '../ErrorBoundary';
import type { Task } from '../../types';
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  onToggleComplete?: () => void;
  onSelect?: (taskId: string) => void;
  level?: number;
  showSubtasks?: boolean;
  bulkMode?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = memo(({ 
  task, 
  onToggleComplete, 
  onSelect,
  level = 0,
  showSubtasks = true,
  bulkMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [showDependenciesManager, setShowDependenciesManager] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const updateTask = useAppStore(state => state.updateTask);
  const deleteTask = useAppStore(state => state.deleteTask);
  const setSelectedTask = useAppStore(state => state.setSelectedTask);

  const handleToggle = useCallback(async () => {
    onToggleComplete?.();
  }, [onToggleComplete]);

  const handleEdit = useCallback(() => {
    setSelectedTask(task.id);
    setIsEditing(true);
  }, [task.id, setSelectedTask]);

  const handleSaveEdit = useCallback(async () => {
    if (editContent.trim() !== task.content) {
      await updateTask(task.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  }, [task.id, editContent, task.content, updateTask]);

  const handleCancelEdit = useCallback(() => {
    setEditContent(task.content);
    setIsEditing(false);
  }, [task.content]);

  const handleDelete = useCallback(async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  }, [task.id, deleteTask]);

  const handleAddSubtask = useCallback((parentId: string) => {
    console.log('Add subtask to:', parentId);
  }, []);

  const labelElements = useMemo(() => {
    if (!task.labels || task.labels.length === 0) return null;
    
    return (
      <div className="flex gap-1 mt-2">
        {task.labels.map((labelId) => (
          <span
            key={labelId}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded"
          >
            {labelId}
          </span>
        ))}
      </div>
    );
  }, [task.labels]);

  return (
    <ErrorBoundary>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm ${
          task.isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Task Checkbox */}
          <TaskCheckbox
            task={task}
            onToggleComplete={handleToggle}
            bulkMode={bulkMode}
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${
                  task.isCompleted ? 'line-through' : ''
                }`}>
                  {task.content}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                )}

                {/* Task Labels */}
                {labelElements}

                {/* Task Metadata */}
                <TaskMeta
                  task={task}
                />
              </div>
            )}
          </div>

          {/* Task Actions */}
          <TaskActions
            task={task}
            onAddSubtask={handleAddSubtask}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleDependencies={() => setShowDependenciesManager(true)}
            onToggleComments={() => setShowComments(true)}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
});

TaskItem.displayName = 'TaskItem';
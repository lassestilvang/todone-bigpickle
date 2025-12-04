import React, { memo, useCallback, useMemo, useState } from 'react';
import { useAppStore, useSubtasks } from '../../store/appStore';
import { TaskCheckbox } from './TaskCheckbox';
import { TaskMeta } from './TaskMeta';
import { TaskActions } from './TaskActions';
import { DependenciesManager } from './DependenciesManager';
import { Comments } from './Comments';
import { TimeTracking } from './TimeTracking';
import { ErrorBoundary } from '../ErrorBoundary';
import type { Task } from '../../types';
import { 
  Tag, 
  ChevronRight,
  ChevronDown,
  GripVertical,
  Square,
  CheckSquare,
  MoreHorizontal,
  Edit3,
  Trash2,
  Clock,
  MessageSquare,
  Link,
  Calendar,
  Flag,
  Users,
  Play,
  Pause
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDependenciesManager, setShowDependenciesManager] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  
  // Use optimized selectors with stable references
  const { 
    setSelectedTask, 
    deleteTask,
    updateTask
  } = useAppStore();
  
  const subtasks = useSubtasks(task.id);
  const visibleSubtasks = useMemo(() => {
    if (!showSubtasks) return [];
    return subtasks;
  }, [showSubtasks, subtasks]);
  
  const hasSubtasks = visibleSubtasks.length > 0;
  
  const hasDependencies = useMemo(() => 
    Boolean(task.dependencies && task.dependencies.length > 0),
    [task.dependencies]
  );
  
  const isBlockedBy = useMemo(() => {
    if (!hasDependencies) return false;
    const store = useAppStore.getState();
    return task.dependencies!.some(depId => {
      const depTask = store.tasks.find(t => t.id === depId);
      return Boolean(depTask && !depTask.isCompleted);
    });
  }, [hasDependencies, task.dependencies]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }), [transform, transition, isSortableDragging]);

  // Memoize callbacks with stable dependencies
  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(task.id);
    } else {
      setSelectedTask(task.id);
    }
  }, [task.id, onSelect, setSelectedTask]);

  const handleToggle = useCallback(async () => {
    try {
      await updateTask(task.id, { isCompleted: !task.isCompleted });
      onToggleComplete?.(task.id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }, [task.id, updateTask, onToggleComplete]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(task.content);
  }, [task.content]);

  const handleSaveEdit = useCallback(async () => {
    try {
      await updateTask(task.id, { content: editContent.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [task.id, updateTask, editContent]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(task.content);
  }, [task.content]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  }, [task.id, deleteTask]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  const handleAddSubtask = useCallback((parentId: string) => {
    // This would open a subtask creation dialog
    console.log('Add subtask to:', parentId);
  }, []);

  const priorityInfo = useMemo(() => {
    const colors = {
      p1: 'text-red-500',
      p2: 'text-orange-500', 
      p3: 'text-blue-500',
      p4: 'text-gray-400'
    };
    
    const icons = {
      p1: '!!!',
      p2: '!!',
      p3: '!',
      p4: ''
    };
    
    return {
      color: colors[task.priority],
      icon: icons[task.priority]
    };
  }, [task.priority]);

  const labelElements = useMemo(() => {
    if (task.labels.length === 0) return null;
    
    return (
      <div className="flex items-center gap-1 mt-2">
        {task.labels.map(labelId => {
          // For now, just show label IDs - in real implementation, would fetch label data
          return (
            <span 
              key={labelId}
              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
            >
              {labelId}
            </span>
          );
        })}
      </div>
    );
  }, [task.labels]);

  return (
    <ErrorBoundary>
      <div 
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 ${
          isDragging ? 'shadow-lg' : 'shadow-sm'
        } ${task.isCompleted ? 'opacity-60' : ''}`}
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
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                onClick={handleSelect}
                className={`cursor-pointer ${
                  task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {priorityInfo.icon && (
                    <span className={`text-xs font-medium ${priorityInfo.color}`}>
                      {priorityInfo.icon}
                    </span>
                  )}
                  <span className="flex-1">{task.content}</span>
                  {task.priority !== 'p4' && (
                    <span className={`text-xs px-2 py-1 rounded ${priorityInfo.color} bg-opacity-10`}>
                      {task.priority.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}

                {/* Task Labels */}
                {labelElements}

                {/* Task Metadata */}
                <TaskMeta
                  task={task}
                  isBlockedBy={isBlockedBy}
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
            onExpand={hasSubtasks ? handleToggleExpand : undefined}
            isExpanded={isExpanded}
            bulkMode={bulkMode}
          />
        </div>

        {/* Subtasks */}
        {hasSubtasks && isExpanded && (
          <div className="ml-8 mt-2">
            {visibleSubtasks.map(subtask => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                onToggleComplete={onToggleComplete}
                onSelect={onSelect}
                level={level + 1}
                showSubtasks={showSubtasks}
                bulkMode={bulkMode}
              />
            ))}
          </div>
        )}

        {/* Dependencies Manager */}
        {showDependenciesManager && (
          <DependenciesManager
            task={task}
            onClose={() => setShowDependenciesManager(false)}
          />
        )}

        {/* Comments */}
        {showComments && (
          <Comments
            task={task}
            onClose={() => setShowComments(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});
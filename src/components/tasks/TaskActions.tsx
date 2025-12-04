import React, { memo, useCallback, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Copy, 
  Archive, 
  Plus,
  Link,
  MessageSquare
} from 'lucide-react';
import type { Task } from '../../types';

interface TaskActionsProps {
  task: Task;
  onAddSubtask?: (parentId: string) => void;
  onShowDependencies?: (taskId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleDependencies?: (taskId: string) => void;
  onToggleComments?: (taskId: string) => void;
  onExpand?: ((e: React.MouseEvent) => void) | undefined;
  isExpanded?: boolean;
  bulkMode?: boolean;
}

export const TaskActions: React.FC<TaskActionsProps> = memo(({ 
  task, 
  onAddSubtask,
  onShowDependencies,
  onEdit,
  onDelete,
  onToggleDependencies,
  onToggleComments,
  onExpand,
  isExpanded,
  bulkMode = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const deleteTask = useAppStore(state => state.deleteTask);
  const setSelectedTask = useAppStore(state => state.setSelectedTask);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      onDelete?.();
    }
    setIsMenuOpen(false);
  }, [task.id, deleteTask, onDelete]);



  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task.id);
    setIsMenuOpen(false);
  }, [task.id, setSelectedTask]);

  const handleDuplicate = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a duplicate of task
    const duplicatedTask = {
      content: `${task.content} (copy)`,
      description: task.description,
      projectId: task.projectId,
      sectionId: task.sectionId,
      priority: task.priority,
      labels: task.labels,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      duration: task.duration,
    };
    
    // This would need to be implemented in store
    console.log('Duplicate task:', duplicatedTask);
    setIsMenuOpen(false);
  }, [task]);

  const handleArchive = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Archive functionality would go here
    console.log('Archive task:', task.id);
    setIsMenuOpen(false);
  }, [task.id]);

  const handleAddSubtask = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSubtask) {
      onAddSubtask(task.id);
    }
    setIsMenuOpen(false);
  }, [task.id, onAddSubtask]);

  const handleDependencies = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleDependencies?.(task.id);
    setIsMenuOpen(false);
  }, [task.id, onToggleDependencies]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Task actions"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={onEdit}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {onEdit && <span className="ml-2">Edit</span>}
          </button>
           <button
             onClick={handleDuplicate}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
           >
             <Copy className="w-4 h-4" />
             Duplicate
           </button>
           <button
             onClick={handleCommentsClick}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
           >
             <MessageSquare className="w-4 h-4" />
             Comments
           </button>
          <button
            onClick={handleAddSubtask}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subtask
          </button>
           <button
             onClick={handleDependencies}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
           >
             <Link className="w-4 h-4" />
             Dependencies
           </button>
           <button
             onClick={handleCommentsClick}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
           >
             <MessageSquare className="w-4 h-4" />
             Comments
           </button>
          <button
            onClick={handleArchive}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
           <button
             onClick={handleComments}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
           >
             <MessageSquare className="w-4 h-4" />
             Comments
           </button>
        </div>
      )}
    </div>
  );
});

TaskActions.displayName = 'TaskActions';
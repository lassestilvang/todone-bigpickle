import React, { memo, useCallback, useState } from 'react';
import { 
  MoreHorizontal, 
  Edit2, 
  Copy, 
  Archive, 
  Plus,
  Link,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Task } from '../../types';

interface TaskActionsProps {
  task: Task;
  onAddSubtask?: (parentId: string) => void;
  onEdit?: () => void;
  onToggleDependencies?: (taskId: string) => void;
  onToggleComments?: (taskId: string) => void;
}

export const TaskActions: React.FC<TaskActionsProps> = memo(({ 
  task, 
  onAddSubtask,
  onEdit,
  onToggleDependencies,
  onToggleComments
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);




  const { createTask } = useAppStore();

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
      isCompleted: false,
    };
    
    try {
      await createTask({
        ...duplicatedTask,
        order: 0 // Will be set automatically by store
      });
      console.log('Task duplicated successfully:', duplicatedTask);
    } catch (error) {
      console.error('Failed to duplicate task:', error);
    }
    setIsMenuOpen(false);
  }, [task, createTask]);

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

  const handleCommentsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComments?.(task.id);
    setIsMenuOpen(false);
  }, [task.id, onToggleComments]);



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
        <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 py-1 z-50">
          <button
            onClick={onEdit}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {onEdit && <span className="ml-2">Edit</span>}
          </button>
           <button
             onClick={handleDuplicate}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
           >
             <Copy className="w-4 h-4" />
             Duplicate
           </button>
           <button
             onClick={handleCommentsClick}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
           >
             <MessageSquare className="w-4 h-4" />
             Comments
           </button>
           <button
             onClick={handleAddSubtask}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
           >
             <Plus className="w-4 h-4" />
             Add Subtask
           </button>
            <button
              onClick={handleDependencies}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              Dependencies
            </button>
            
           <button
             onClick={handleArchive}
             className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2"
           >
             <Archive className="w-4 h-4" />
             Archive
           </button>
        </div>
      )}
    </div>
  );
});

TaskActions.displayName = 'TaskActions';
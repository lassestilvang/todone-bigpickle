import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { 
  Check, 
  X, 
  Trash2, 
  Archive, 
  Tag, 
  Flag, 
  FolderOpen,
  Copy
} from 'lucide-react';

interface BulkActionsProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
  onActionComplete?: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedTaskIds, 
  onClearSelection,
  onActionComplete 
}) => {
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);
  
  const { 
    tasks, 
    projects, 
    labels,
    updateTask, 
    deleteTask,
    toggleTaskComplete
  } = useAppStore();

  if (selectedTaskIds.length === 0) return null;

  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));

  const handleBulkComplete = async () => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => toggleTaskComplete(taskId))
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to complete tasks:', error);
    }
  };

  const handleBulkUncomplete = async () => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          if (task?.isCompleted) {
            return toggleTaskComplete(taskId);
          }
        })
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to uncomplete tasks:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.length} task(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => deleteTask(taskId))
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const handleBulkArchive = async () => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => 
          updateTask(taskId, { isCompleted: true })
        )
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to archive tasks:', error);
    }
  };

  const handleBulkPriority = async (priority: string) => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => 
          updateTask(taskId, { priority: priority as 'p1' | 'p2' | 'p3' | 'p4' })
        )
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to update priorities:', error);
    }
  };

  const handleBulkProject = async (projectId: string | null) => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => 
          updateTask(taskId, { projectId: projectId || undefined })
        )
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to update projects:', error);
    }
  };

  const handleBulkLabel = async (labelId: string, add: boolean) => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          const currentLabels = task?.labels || [];
          const newLabels = add 
            ? [...currentLabels, labelId]
            : currentLabels.filter(id => id !== labelId);
          
          return updateTask(taskId, { labels: newLabels });
        })
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to update labels:', error);
    }
  };

  const handleBulkDuplicate = async () => {
    try {
      await Promise.all(
        selectedTaskIds.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;
          
          return updateTask(taskId, {
            content: task.content + ' (Copy)',
            isCompleted: false,
            completedAt: undefined
          });
        })
      );
      onClearSelection();
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to duplicate tasks:', error);
    }
  };

  const priorities = [
    { id: 'p1', label: 'Priority 1', color: 'text-red-600 bg-red-50' },
    { id: 'p2', label: 'Priority 2', color: 'text-orange-600 bg-orange-50' },
    { id: 'p3', label: 'Priority 3', color: 'text-blue-600 bg-blue-50' },
    { id: 'p4', label: 'No Priority', color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
          </span>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Complete/Uncomplete */}
          {selectedTasks.some(t => !t.isCompleted) && (
            <button
              onClick={handleBulkComplete}
              className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Check className="h-4 w-4" />
              Complete
            </button>
          )}
          
          {selectedTasks.some(t => t.isCompleted) && (
            <button
              onClick={handleBulkUncomplete}
              className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            >
              <X className="h-4 w-4" />
              Uncomplete
            </button>
          )}

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
              className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Flag className="h-4 w-4" />
              Priority
            </button>
            
            {isPriorityMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]">
                {priorities.map(priority => (
                  <button
                    key={priority.id}
                    onClick={() => {
                      handleBulkPriority(priority.id);
                      setIsPriorityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${priority.color}`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project */}
          <div className="relative">
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            >
              <FolderOpen className="h-4 w-4" />
              Move to
            </button>
            
            {isProjectMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    handleBulkProject(null);
                    setIsProjectMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Inbox
                </button>
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      handleBulkProject(project.id);
                      setIsProjectMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="relative">
            <button
              onClick={() => setIsLabelMenuOpen(!isLabelMenuOpen)}
              className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Tag className="h-4 w-4" />
              Labels
            </button>
            
            {isLabelMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] max-h-60 overflow-y-auto">
                {labels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => {
                      const hasLabel = selectedTasks.some(t => t.labels.includes(label.id));
                      handleBulkLabel(label.id, !hasLabel);
                      setIsLabelMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                    {selectedTasks.some(t => t.labels.includes(label.id)) && (
                      <Check className="h-3 w-3 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duplicate */}
          <button
            onClick={handleBulkDuplicate}
            className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>

          {/* Archive */}
          <button
            onClick={handleBulkArchive}
            className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>

          {/* Delete */}
          <button
            onClick={handleBulkDelete}
            className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Task } from '../../types';
import { 
  Link, 
  X, 
  Search,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';

interface DependenciesManagerProps {
  task: Task;
  onClose: () => void;
}

export const DependenciesManager: React.FC<DependenciesManagerProps> = ({ 
  task, 
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    task.dependencies || []
  );
  
  const { tasks, updateTask } = useAppStore();

  // Filter tasks that can be dependencies (not the current task, not subtasks, not circular dependencies)
  const availableTasks = tasks.filter(t => 
    t.id !== task.id && 
    !t.parentTaskId && // Not a subtask
    t.id !== task.parentTaskId && // Not the parent task
    !task.dependencies?.includes(t.id) && // Not already a dependency
    (t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleDependency = (taskId: string) => {
    setSelectedDependencies(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSave = async () => {
    try {
      await updateTask(task.id, { dependencies: selectedDependencies });
      onClose();
    } catch (error) {
      console.error('Failed to update dependencies:', error);
    }
  };

  const getDependencyStatus = (taskId: string) => {
    const dependencyTask = tasks.find(t => t.id === taskId);
    if (!dependencyTask) return 'unknown';
    return dependencyTask.isCompleted ? 'completed' : 'pending';
  };

  const isCircularDependency = (taskId: string) => {
    // Check if adding this task as a dependency would create a circular dependency
    const checkCircular = (checkTaskId: string, visited: Set<string>): boolean => {
      if (visited.has(checkTaskId)) return true;
      visited.add(checkTaskId);
      
      const checkTask = tasks.find(t => t.id === checkTaskId);
      if (checkTask?.dependencies) {
        for (const depId of checkTask.dependencies) {
          if (checkCircular(depId, new Set(visited))) {
            return true;
          }
        }
      }
      return false;
    };

    return checkCircular(taskId, new Set([task.id]));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Dependencies
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Current Task Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Managing dependencies for: <span className="font-medium text-gray-900">{task.content}</span>
          </div>
          {selectedDependencies.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {selectedDependencies.length} task{selectedDependencies.length !== 1 ? 's' : ''} selected as dependencies
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks to add as dependencies..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {availableTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? 'No tasks found matching your search' : 'No available tasks to add as dependencies'}
            </div>
          ) : (
            <div className="space-y-2">
              {availableTasks.map((availableTask) => {
                const status = getDependencyStatus(availableTask.id);
                const isSelected = selectedDependencies.includes(availableTask.id);
                const isCircular = isCircularDependency(availableTask.id);

                return (
                  <div
                    key={availableTask.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${isCircular ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => !isCircular && handleToggleDependency(availableTask.id)}
                      disabled={isCircular}
                      className={`flex-shrink-0 ${
                        isCircular ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-primary-500" />
                      ) : isCircular ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${
                          availableTask.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {availableTask.content}
                        </span>
                        {status === 'completed' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Completed
                          </span>
                        )}
                        {isCircular && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Circular
                          </span>
                        )}
                      </div>
                      
                      {availableTask.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {availableTask.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {availableTask.dueDate && (
                          <span>Due: {availableTask.dueDate.toLocaleDateString()}</span>
                        )}
                        {availableTask.priority !== 'p4' && (
                          <span className={`font-medium ${
                            availableTask.priority === 'p1' ? 'text-red-500' :
                            availableTask.priority === 'p2' ? 'text-orange-500' :
                            'text-blue-500'
                          }`}>
                            {availableTask.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Tasks must be completed before this task can be marked complete
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Save Dependencies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
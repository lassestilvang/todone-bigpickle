import React, { useState, useMemo } from 'react';
import { TaskItem } from '../tasks/TaskItem';
import { useTasksByQuery } from '../../store/appStore';
import type { TaskQuery, Task } from '../../types';
import { Filter, SortAsc, ChevronDown } from 'lucide-react';

interface FilteredTasksViewProps {
  title: string;
  query: TaskQuery;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export const FilteredTasksView: React.FC<FilteredTasksViewProps> = ({
  title,
  query,
  emptyMessage = 'No tasks found',
  emptyIcon
}) => {
  const [sortBy, setSortBy] = useState<'order' | 'dueDate' | 'priority'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
    const filteredTasks = useTasksByQuery(query);
  
  const sortedTasks = useMemo(() => {
    // Apply sorting
    return [...filteredTasks].sort((a: Task, b: Task) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority': {
          const priorityOrder = { p1: 0, p2: 1, p3: 2, p4: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'order':
        default:
          comparison = a.order - b.order;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredTasks, sortBy, sortOrder]);

  const getTaskCount = () => sortedTasks.length;



  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {getTaskCount()} {getTaskCount() === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-ghost px-3 py-2 text-sm flex items-center gap-2"
              >
                <SortAsc className="h-4 w-4" />
                Sort
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <div className="px-3 py-2 text-xs text-gray-500 font-medium">Sort by</div>
                  <button
                    onClick={() => {
                      setSortBy('order');
                      setShowFilters(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      sortBy === 'order' ? 'bg-gray-100 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Order
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('dueDate');
                      setShowFilters(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      sortBy === 'dueDate' ? 'bg-gray-100 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Due Date
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('priority');
                      setShowFilters(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      sortBy === 'priority' ? 'bg-gray-100 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Priority
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-3 py-2 text-xs text-gray-500 font-medium">Order</div>
                  <button
                    onClick={() => {
                      setSortOrder('asc');
                      setShowFilters(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      sortOrder === 'asc' ? 'bg-gray-100 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Ascending
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('desc');
                      setShowFilters(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      sortOrder === 'desc' ? 'bg-gray-100 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    Descending
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {emptyIcon || <Filter className="h-12 w-12 mb-4 text-gray-300" />}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyMessage}
            </h3>
            <p className="text-sm">
              Try adjusting your filters or create new tasks
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {sortedTasks.map((task: Task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
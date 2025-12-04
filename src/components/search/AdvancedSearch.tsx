import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import type { TaskQuery, Priority } from '../../types';
import { 
  Search, 
  X, 
  Calendar, 
  Tag, 
  Folder, 
  Flag
} from 'lucide-react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: TaskQuery) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  isOpen, 
  onClose, 
  onSearch 
}) => {
  const [query, setQuery] = useState<TaskQuery>({});
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const { projects, labels } = useAppStore();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      const timer = setTimeout(() => {
        setQuery({});
        setSearchText('');
        setDateRange('all');
        setCustomStartDate('');
        setCustomEndDate('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearch = () => {
    const newQuery: TaskQuery = {
      ...query,
      search: searchText.trim() || undefined,
    };

    // Handle date range
    if (dateRange !== 'all') {
      const now = new Date();
      let start: Date | undefined;
      let end: Date | undefined;

      switch (dateRange) {
        case 'today':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          if (customStartDate) {
            start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
          }
          if (customEndDate) {
            end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
          }
          break;
      }

      if (start || end) {
        newQuery.dateRange = { start, end };
      }
    }

    onSearch(newQuery);
    onClose();
  };

  const togglePriority = (priority: Priority) => {
    setQuery(prev => {
      const current = prev.priority || [];
      const updated = current.includes(priority)
        ? current.filter(p => p !== priority)
        : [...current, priority];
      return { ...prev, priority: updated.length > 0 ? updated : undefined };
    });
  };

  const toggleLabel = (labelId: string) => {
    setQuery(prev => {
      const current = prev.labels || [];
      const updated = current.includes(labelId)
        ? current.filter(id => id !== labelId)
        : [...current, labelId];
      return { ...prev, labels: updated.length > 0 ? updated : undefined };
    });
  };

  const toggleProject = (projectId: string) => {
    setQuery(prev => {
      const current = prev.projects || [];
      const updated = current.includes(projectId)
        ? current.filter(id => id !== projectId)
        : [...current, projectId];
      return { ...prev, projects: updated.length > 0 ? updated : undefined };
    });
  };

  const clearAll = () => {
    setQuery({});
    setSearchText('');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchText) count++;
    if (query.priority?.length) count++;
    if (query.labels?.length) count++;
    if (query.projects?.length) count++;
    if (query.isCompleted !== undefined) count++;
    if (dateRange !== 'all') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Text Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Text
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search in task titles and descriptions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Due Date Range
            </label>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="custom">Custom range</option>
              </select>
              
              {dateRange === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="inline h-4 w-4 mr-1" />
              Priority
            </label>
            <div className="flex items-center gap-2">
              {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    query.priority?.includes(priority)
                      ? priority === 'p1' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                        priority === 'p2' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                        priority === 'p3' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                        'bg-gray-100 text-gray-700 border-2 border-gray-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {priority === 'p1' ? 'P1 (High)' :
                   priority === 'p2' ? 'P2 (Medium)' :
                   priority === 'p3' ? 'P3 (Low)' :
                   'P4 (None)'}
                </button>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="inline h-4 w-4 mr-1" />
              Projects
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={query.projects?.includes(project.id) || false}
                    onChange={() => toggleProject(project.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm text-gray-700">{project.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Labels
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {labels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={query.labels?.includes(label.id) || false}
                    onChange={() => toggleLabel(label.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm text-gray-700">{label.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={query.isCompleted === undefined}
                  onChange={() => setQuery(prev => ({ ...prev, isCompleted: undefined }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All tasks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={query.isCompleted === false}
                  onChange={() => setQuery(prev => ({ ...prev, isCompleted: false }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={query.isCompleted === true}
                  onChange={() => setQuery(prev => ({ ...prev, isCompleted: true }))}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Completed only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { Search, Plus, Calendar, Clock, Flag, Folder, Tag, Filter, SlidersHorizontal } from 'lucide-react';
import type { Task, Project, Label, Filter as FilterType, TaskQuery } from '../types';
import { AdvancedSearch } from './search/AdvancedSearch';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'view' | 'task' | 'project' | 'label' | 'filter' | 'action';
  title: string;
  description?: string;
  icon: React.ReactElement;
  data?: Task | Project | Label | FilterType;
  // Task-specific properties
  priority?: 'p1' | 'p2' | 'p3' | 'p4';
  completed?: boolean;
  // Project/Label/Filter-specific properties
  color?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    tasks, 
    projects,
    labels,
    filters,
    setCurrentView,
    setSelectedTask,
    setSelectedLabel,
    setSelectedFilter,
    setCurrentProject,
    createTask,
    createFilter
  } = useAppStore();

  const handleClose = useCallback(() => {
    onClose();
    setQuery('');
    setSelectedIndex(0);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when palette opens
      inputRef.current.focus();
      
      // Store previous focus for restoration
      const previousActiveElement = document.activeElement as HTMLElement;
      
      return () => {
        // Restore focus when palette closes
        if (previousActiveElement && previousActiveElement.focus) {
          previousActiveElement.focus();
        }
      };
    }
  }, [isOpen]);

  // Filter results based on query
  const getFilteredResults = useCallback((): SearchResult[] => {
    const results: SearchResult[] = [];

    // Quick actions
    if (query.trim()) {
      results.push({
        id: 'create-task',
        type: 'action' as const,
        title: `Create task: "${query}"`,
        icon: <Plus />,
        description: 'Add a new task'
      });
    }

     // Views
     results.push(
       {
         id: 'inbox',
         type: 'view' as const,
         title: 'Inbox',
         icon: <Search />,
         description: 'View tasks without a project'
       },
       {
         id: 'today',
         type: 'view' as const,
         title: 'Today',
         icon: <Calendar />,
         description: 'View tasks due today'
       },
       {
         id: 'upcoming',
         type: 'view' as const,
         title: 'Upcoming',
         icon: <Clock />,
         description: 'View upcoming tasks'
       },
       {
         id: 'advanced-search',
         type: 'action' as const,
         title: 'Advanced Search',
         icon: <SlidersHorizontal />,
         description: 'Search with advanced filters'
       }
     );

    // Projects
    projects.forEach((project) => {
      results.push({
        id: project.id,
        type: 'project' as const,
        title: project.name,
        icon: <Folder />,
        description: `View ${project.name} project`,
        color: project.color
      });
    });

    // Labels
    labels.forEach((label) => {
      results.push({
        id: label.id,
        type: 'label' as const,
        title: label.name,
        icon: <Tag />,
        description: `View tasks with ${label.name} label`,
        color: label.color
      });
    });

    // Filters
    filters.forEach((filter) => {
      results.push({
        id: filter.id,
        type: 'filter' as const,
        title: filter.name,
        icon: <Filter />,
        description: filter.query,
        color: filter.color
      });
    });

    // Tasks
    tasks
      .filter((task) => 
        task.content.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .forEach((task) => {
        results.push({
          id: task.id,
          type: 'task' as const,
          title: task.content,
          icon: <Flag />,
          description: task.description || 'No description',
          priority: task.priority,
          completed: task.isCompleted
        });
      });

    return results.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, projects, labels, filters, tasks]);

  const handleResultClick = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'view':
        setCurrentView(result.id as 'inbox' | 'today' | 'upcoming' | 'projects' | 'filters' | 'labels');
        break;
      case 'task':
        setSelectedTask(result.id);
        break;
      case 'project':
        setCurrentView('projects');
        setCurrentProject(result.id);
        break;
      case 'label':
        setCurrentView('labels');
        setSelectedLabel(result.id);
        break;
      case 'filter':
        setCurrentView('filters');
        setSelectedFilter(result.id);
        break;
       case 'action':
         if (result.id === 'advanced-search') {
           setShowAdvancedSearch(true);
         } else if (query.trim()) {
           createTask({
             content: query.trim(),
             priority: 'p4',
             labels: [],
             order: 0,
             isCompleted: false
           });
         }
         break;
    }
    handleClose();
  }, [setCurrentView, setSelectedTask, setSelectedLabel, setSelectedFilter, setCurrentProject, createTask, query, handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const results = getFilteredResults();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, handleClose, handleResultClick, getFilteredResults]);

  if (!isOpen) return null;

  const filteredResults = getFilteredResults();

  const handleAdvancedSearch = (query: TaskQuery) => {
    // Navigate to filters view with the advanced search query
    const queryString = JSON.stringify(query);
    const tempFilterId = 'temp-advanced-search';
    
    // Create a temporary filter for the advanced search
    createFilter({
      name: 'Advanced Search',
      query: queryString,
      color: '#6366f1',
      isFavorite: false,
      ownerId: 'user-1'
    }).then(() => {
      setCurrentView('filters');
      setSelectedFilter(tempFilterId);
      setShowAdvancedSearch(false);
      handleClose();
    }).catch(error => {
      console.error('Failed to create advanced search filter:', error);
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, projects, labels, or commands..."
              className="flex-1 outline-none text-lg bg-transparent"
              autoFocus
              id="command-palette-input"
              aria-label="Search tasks, projects, labels, or commands"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close command palette"
            >
              ×
            </button>
          </div>
        </div>

        <div 
          className="max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400" role="status">
              No results found
            </div>
          ) : (
            <div className="py-2" role="presentation">
              {filteredResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  id={`result-${index}`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {result.type === 'project' && 'color' in result ? (
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: result.color }}
                      ></div>
                    ) : (
                      <span className="inline-flex">{result.icon}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {result.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.description}
                    </div>
                  </div>

                  {result.type === 'task' && (
                    <div className="flex items-center gap-2">
                      {result.priority && result.priority !== 'p4' && (
                        <span className={`text-xs font-medium ${
                          result.priority === 'p1' ? 'text-red-500' :
                          result.priority === 'p2' ? 'text-orange-500' :
                          'text-blue-500'
                        }`}>
                          {result.priority === 'p1' ? '!!!' :
                           result.priority === 'p2' ? '!!' : '!'}
                        </span>
                      )}
                      {result.completed && (
                        <span className="text-xs text-gray-500">✓</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
};
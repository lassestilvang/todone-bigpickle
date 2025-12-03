import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Search, Plus, Calendar, Clock, Flag, Tag, Folder, Filter } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    tasks, 
    projects, 
    labels, 
    filters,
    setCurrentView,
    setSelectedTask,
    createTask,
    user
  } = useAppStore();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleResultClick(filteredResults[selectedIndex]);
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
  }, [isOpen, selectedIndex, filteredResults]);

  const handleClose = () => {
    onClose();
    setQuery('');
    setSelectedIndex(0);
  };

  const handleResultClick = (result: any) => {
    switch (result.type) {
      case 'view':
        setCurrentView(result.id);
        break;
      case 'task':
        setSelectedTask(result.id);
        break;
      case 'project':
        setCurrentView('projects');
        // TODO: Navigate to specific project
        break;
      case 'create-task':
        if (query.trim()) {
          createTask({
            content: query.trim(),
            priority: 'p4',
            labels: [],
            order: 0,
            isCompleted: false,
            ownerId: user?.id || ''
          });
        }
        break;
    }
    handleClose();
  };

  // Filter results based on query
  const filteredResults = [
    // Quick actions
    ...(query.trim() ? [{
      id: 'create-task',
      type: 'create-task',
      title: `Create task: "${query}"`,
      icon: Plus,
      description: 'Add a new task'
    }] : []),

    // Views
    {
      id: 'inbox',
      type: 'view',
      title: 'Inbox',
      icon: Search,
      description: 'View tasks without a project'
    },
    {
      id: 'today',
      type: 'view',
      title: 'Today',
      icon: Calendar,
      description: 'View tasks due today'
    },
    {
      id: 'upcoming',
      type: 'view',
      title: 'Upcoming',
      icon: Clock,
      description: 'View upcoming tasks'
    },

    // Projects
    ...projects.map(project => ({
      id: project.id,
      type: 'project',
      title: project.name,
      icon: Folder,
      description: `View ${project.name} project`,
      color: project.color
    })),

    // Tasks
    ...tasks
      .filter(task => 
        task.content.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        type: 'task',
        title: task.content,
        icon: Flag,
        description: task.description || 'No description',
        priority: task.priority,
        completed: task.isCompleted
      }))
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
            />
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {filteredResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {result.type === 'project' && result.color ? (
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: result.color }}
                      ></div>
                    ) : (
                      <result.icon className="h-4 w-4 text-gray-400" />
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
                      {result.priority !== 'p4' && (
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
    </div>
  );
};
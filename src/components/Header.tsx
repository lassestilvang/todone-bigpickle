import React from 'react';
import { useAppStore } from '../store/appStore';
import { Search, Bell, Settings, HelpCircle, Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentView, 
    currentProjectId,
    projects,
    theme,
    setTheme
  } = useAppStore();

  const getCurrentViewTitle = () => {
    if (currentProjectId) {
      const project = projects.find((p) => p.id === currentProjectId);
      return project?.name || 'Project';
    }

    switch (currentView) {
      case 'inbox':
        return 'Inbox';
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'projects':
        return 'Projects';
      case 'filters':
        return 'Filters';
      case 'labels':
        return 'Labels';
      default:
        return 'Todone';
    }
  };

  const handleSearch = () => {
    // This will open the command palette
    const event = new KeyboardEvent('keydown', { 
      key: 'k', 
      metaKey: true, 
      ctrlKey: true 
    });
    document.dispatchEvent(event);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {getCurrentViewTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={handleSearch}
          className="btn btn-ghost px-3 py-2 text-sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost p-2"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost p-2 relative" title="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="btn btn-ghost p-2" title="Help">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Settings */}
        <button className="btn btn-ghost p-2" title="Settings">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
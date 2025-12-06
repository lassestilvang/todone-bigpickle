import React from 'react';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Settings, HelpCircle, Moon, Sun, Monitor, Menu, Keyboard } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  onShortcutsHelp?: () => void;
  onSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false, onShortcutsHelp, onSettings }) => {
  const { 
    currentView, 
    currentProjectId,
    projects
  } = useAppStore();
  const { theme, setTheme } = useTheme();

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
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" aria-hidden="true" />;
      case 'dark':
        return <Moon className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Monitor className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-between px-4 md:px-6">
      {/* Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
          {getCurrentViewTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search */}
        <button
          onClick={handleSearch}
          className="btn btn-ghost px-2 md:px-3 py-2 text-sm"
          aria-label="Open search"
        >
          <Search className="h-4 w-4 md:mr-2" aria-hidden="true" />
          <span className="hidden md:inline">Search</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost p-2"
          aria-label={`Current theme: ${theme}. Click to cycle themes`}
        >
          {getThemeIcon()}
        </button>

        {/* Notifications - Now handled by NotificationCenter */}

        {/* Help - Hidden on mobile */}
        <button className="btn btn-ghost p-2 hidden md:block" title="Help">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Settings - Hidden on mobile */}
        <button 
          onClick={onSettings}
          className="btn btn-ghost p-2 hidden md:block" 
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Keyboard Shortcuts Help */}
        <button 
          onClick={onShortcutsHelp}
          className="btn btn-ghost p-2" 
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
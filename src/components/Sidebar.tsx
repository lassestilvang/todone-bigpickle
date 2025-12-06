import React from 'react';
import { useAppStore } from '../store/appStore';
import type { ViewType } from '../types';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  Folder, 
  Tag, 
  Filter,
  Plus,
  Settings,
  User,
  ChevronLeft,
  Trophy,
  FileText
} from 'lucide-react';

interface SidebarProps {
  onSettingsClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
  const { 
    sidebarCollapsed, 
    currentView, 
    setCurrentView, 
    toggleSidebar,
    user,
    projects,
    labels,
    filters
  } = useAppStore();

  const navigationItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: 0 },
    { id: 'today', label: 'Today', icon: Calendar, count: 0 },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: 0 },
  ];

  const secondaryItems = [
    { id: 'projects', label: 'Projects', icon: Folder, count: projects.length },
    { id: 'filters', label: 'Filters', icon: Filter, count: filters.length },
    { id: 'labels', label: 'Labels', icon: Tag, count: labels.length },
    { id: 'templates', label: 'Templates', icon: FileText, count: 0 },
    { id: 'karma', label: 'Karma', icon: Trophy, count: 0 },
  ];

  if (sidebarCollapsed) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700">
        {/* Logo */}
        <div className="p-4 flex items-center justify-center border-b border-gray-200 dark:border-zinc-700">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-md dark:shadow-lg dark:shadow-primary-500/20">
            <span className="text-white font-bold">T</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                  currentView === item.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                  className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                    currentView === item.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User Avatar */}
        <div className="p-2 border-t border-gray-200 dark:border-zinc-700">
          <button 
            onClick={onSettingsClick}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Todone</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Quick Add */}
        <button className="btn btn-primary w-full py-2 text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                className={`sidebar-item w-full ${
                  currentView === item.id ? 'active' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full dark:bg-zinc-700 dark:text-zinc-300">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <button
                key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                className={`sidebar-item w-full ${
                  currentView === item.id ? 'active' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full dark:bg-zinc-700 dark:text-zinc-300">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600 dark:text-zinc-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
              {user?.email}
            </p>
          </div>
          <button 
            onClick={onSettingsClick}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
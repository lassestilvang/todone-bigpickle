import React from 'react';
import { useAppStore } from '../store/appStore';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  Folder, 
  Tag, 
  Filter,
  Plus,
  Settings,
  ChevronLeft,
  User
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    sidebarCollapsed, 
    currentView, 
    setCurrentView, 
    toggleSidebar,
    user,
    projects
  } = useAppStore();

  const navigationItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: 0 },
    { id: 'today', label: 'Today', icon: Calendar, count: 0 },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: 0 },
  ];

  const secondaryItems = [
    { id: 'projects', label: 'Projects', icon: Folder, count: projects.length },
    { id: 'filters', label: 'Filters', icon: Filter, count: 0 },
    { id: 'labels', label: 'Labels', icon: Tag, count: 0 },
  ];

  if (sidebarCollapsed) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Logo */}
        <div className="p-4 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                  currentView === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                    currentView === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
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
        <div className="p-2 border-t border-gray-200">
          <button className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-semibold text-gray-900">Todone</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
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
                onClick={() => setCurrentView(item.id as any)}
                className={`sidebar-item w-full ${
                  currentView === item.id ? 'active' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
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
                onClick={() => setCurrentView(item.id as any)}
                className={`sidebar-item w-full ${
                  currentView === item.id ? 'active' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <Settings className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
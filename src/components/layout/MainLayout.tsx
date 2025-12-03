import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { InboxView } from '../views/InboxView';
import { TodayView } from '../views/TodayView';
import { UpcomingView } from '../views/UpcomingView';
import { ProjectsView } from '../views/ProjectsView';
import { TaskDetail } from '../TaskDetail';
import { QuickAdd } from '../QuickAdd';
import { CommandPalette } from '../CommandPalette';
import { initDatabase } from '../../lib/database';

export const MainLayout: React.FC = () => {
  const { 
    currentView, 
    sidebarCollapsed, 
    selectedTaskId,
    loadTasks,
    loadProjects,
    loadSections,
    loadLabels,
    loadFilters
  } = useAppStore();

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    // Initialize database and load data
    const initializeApp = async () => {
      try {
        await initDatabase();
        await Promise.all([
          loadTasks(),
          loadProjects(),
          loadSections(),
          loadLabels(),
          loadFilters()
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadTasks, loadProjects, loadSections, loadLabels, loadFilters]);

  useEffect(() => {
    // Keyboard shortcut for command palette (Cmd/Ctrl + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'inbox':
        return <InboxView />;
      case 'today':
        return <TodayView />;
      case 'upcoming':
        return <UpcomingView />;
      case 'projects':
        return <ProjectsView />;
      case 'filters':
        return <div className="p-6">Filters view coming soon...</div>;
      case 'labels':
        return <div className="p-6">Labels view coming soon...</div>;
      default:
        return <InboxView />;
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300 border-r border-gray-200`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* View Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {renderCurrentView()}
          </div>

          {/* Task Detail Panel */}
          {selectedTaskId && (
            <div className="w-96 border-l border-gray-200 flex-shrink-0">
              <TaskDetail taskId={selectedTaskId} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Button */}
      <QuickAdd />

      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />
    </div>
  );
};
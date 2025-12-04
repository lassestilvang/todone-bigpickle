import React, { useEffect, useState, Suspense } from 'react';
import { useAppStore } from '../../store/appStore';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAppKeyboardShortcuts } from '../../lib/keyboardShortcuts';
import { notificationService } from '../../lib/notificationService';
import { initDatabase } from '../../lib/database';
import { X } from 'lucide-react';

// Lazy load heavy components for better code splitting
const TaskDetail = React.lazy(() => import('../TaskDetail').then(module => ({ default: module.TaskDetail })));
const QuickAdd = React.lazy(() => import('../QuickAdd').then(module => ({ default: module.QuickAdd })));
const CommandPalette = React.lazy(() => import('../CommandPalette').then(module => ({ default: module.CommandPalette })));
const KeyboardShortcutsHelp = React.lazy(() => import('../KeyboardShortcutsHelp').then(module => ({ default: module.KeyboardShortcutsHelp })));
const QuickFilters = React.lazy(() => import('../QuickFilters').then(module => ({ default: module.QuickFilters })));
const BulkActions = React.lazy(() => import('../BulkActions').then(module => ({ default: module.BulkActions })));
const Settings = React.lazy(() => import('../Settings').then(module => ({ default: module.Settings })));

// Lazy load views for code splitting
const InboxView = React.lazy(() => import('../views/InboxView').then(module => ({ default: module.InboxView })));
const TodayView = React.lazy(() => import('../views/TodayView').then(module => ({ default: module.TodayView })));
const UpcomingView = React.lazy(() => import('../views/UpcomingView').then(module => ({ default: module.UpcomingView })));
const ProjectsView = React.lazy(() => import('../views/ProjectsView').then(module => ({ default: module.ProjectsView })));
const FiltersView = React.lazy(() => import('../views/FiltersView').then(module => ({ default: module.FiltersView })));
const LabelsView = React.lazy(() => import('../views/LabelsView').then(module => ({ default: module.LabelsView })));
const KarmaDashboard = React.lazy(() => import('../views/KarmaView').then(module => ({ default: module.KarmaDashboard })));
const TemplatesManager = React.lazy(() => import('../views/TemplatesView').then(module => ({ default: module.TemplatesManager })));
const CompletedView = React.lazy(() => import('../views/CompletedView').then(module => ({ default: module.CompletedView })));

export const MainLayout: React.FC = () => {
  const { 
    currentView, 
    sidebarCollapsed, 
    selectedTaskId,
    selectedTaskIds,
    clearSelectedTasks
  } = useAppStore();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // Initialize keyboard shortcuts
  useAppKeyboardShortcuts(() => setIsCommandOpen(true));

  // Initialize notification service with store
  useEffect(() => {
    const store = {
      getTasks: () => {
        const state = useAppStore.getState();
        return state.tasks;
      }
    };
    notificationService.setStore(store);
  }, []);

  // Detect mobile screen size with debounced resize handler
  useEffect(() => {
    let timeoutId: number;
    
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
          setIsMobileSidebarOpen(false);
        }
      }, 150); // Debounce resize events
    };

    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Initialize database and load data
    const initializeApp = async () => {
      try {
        await initDatabase();
        const store = useAppStore.getState();
        await Promise.all([
          store.loadTasks(),
          store.loadProjects(),
          store.loadSections(),
          store.loadLabels(),
          store.loadFilters()
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Additional keyboard shortcuts not covered by main system
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close mobile sidebar on Escape
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
      
      // Open shortcuts help with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          target.contentEditable !== 'true'
        ) {
          e.preventDefault();
          setIsShortcutsHelpOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  const renderCurrentView = () => {
    const viewComponent = (() => {
      switch (currentView) {
        case 'inbox':
          return <InboxView bulkMode={bulkMode} />;
        case 'today':
          return <TodayView bulkMode={bulkMode} />;
        case 'upcoming':
          return <UpcomingView bulkMode={bulkMode} />;
        case 'projects':
          return <ProjectsView bulkMode={bulkMode} />;
        case 'filters':
          return <FiltersView bulkMode={bulkMode} />;
        case 'labels':
          return <LabelsView bulkMode={bulkMode} />;
        case 'templates':
          return <TemplatesManager bulkMode={bulkMode} />;
        case 'karma':
          return <KarmaDashboard bulkMode={bulkMode} />;
        case 'completed':
          return <CompletedView bulkMode={bulkMode} />;
        default:
          return <InboxView bulkMode={bulkMode} />;
      }
    })();

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      }>
        {viewComponent}
      </Suspense>
    );
  };

  const getSidebarClasses = () => {
    const classes = ['border-r', 'border-gray-200', 'bg-white'];
    
    if (sidebarCollapsed) {
      classes.push('w-16');
    } else {
      classes.push('w-64');
    }
    
    if (isMobile) {
      classes.push('fixed', 'inset-y-0', 'left-0', 'z-50', 'transform', 'transition-transform', 'duration-300');
      if (!isMobileSidebarOpen) {
        classes.push('-translate-x-full');
      } else {
        classes.push('translate-x-0');
      }
    } else {
      classes.push('flex-shrink-0');
    }
    
    return classes.join(' ');
  };

  const getTaskDetailClasses = () => {
    const classes = ['transition-all', 'duration-300'];
    
    if (isMobile) {
      classes.push('fixed', 'inset-0', 'z-50', 'bg-white');
    } else {
      classes.push('w-96', 'border-l', 'border-gray-200', 'flex-shrink-0');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="h-screen flex bg-white relative">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {selectedTaskIds.length > 0 && `${selectedTaskIds.length} task${selectedTaskIds.length > 1 ? 's' : ''} selected`}
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsMobileSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div className={getSidebarClasses()}>
        <Sidebar />
        {isMobile && (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          showMenuButton={isMobile}
          onShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
          onSettings={() => setIsSettingsOpen(true)}
        />

        {/* View Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Filters */}
            <QuickFilters 
              bulkMode={bulkMode}
              onBulkModeChange={setBulkMode}
            />
            
            {/* Main Content */}
            <main 
              className="flex-1 overflow-auto"
              role="main"
              aria-label={`${currentView} view`}
            >
              <Suspense fallback={
                <div className="p-4" role="status" aria-live="polite">
                  <div className="animate-pulse">Loading...</div>
                </div>
              }>
                {renderCurrentView()}
              </Suspense>
            </main>
          </div>

          {/* Task Detail Panel - Responsive */}
          {selectedTaskId && (
            <div className={getTaskDetailClasses()}>
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  console.error('TaskDetail error:', error, errorInfo);
                  // Clear selection on error to prevent stuck modal
                  const { setSelectedTask } = useAppStore.getState();
                  setSelectedTask(null);
                }}
              >
                <TaskDetail 
                  taskId={selectedTaskId} 
                  onClose={() => {
                    if (isMobile) {
                      // Close task detail on mobile by clearing selection
                      const { setSelectedTask } = useAppStore.getState();
                      setSelectedTask(null);
                    }
                  }}
                  showCloseButton={isMobile}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Button */}
      <QuickAdd />

      {/* Command Palette */}
      <ErrorBoundary>
        <CommandPalette 
          isOpen={isCommandOpen} 
          onClose={() => setIsCommandOpen(false)} 
        />
      </ErrorBoundary>

      {/* Keyboard Shortcuts Help */}
      <ErrorBoundary>
        <KeyboardShortcutsHelp 
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
        />
      </ErrorBoundary>

      {/* Settings */}
      <ErrorBoundary>
        <Settings 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </ErrorBoundary>

      {/* Bulk Actions */}
      <BulkActions 
        selectedTaskIds={selectedTaskIds}
        onClearSelection={clearSelectedTasks}
        onActionComplete={() => {
          // Refresh current view
          console.log('Bulk action completed');
        }}
      />
    </div>
  );
};
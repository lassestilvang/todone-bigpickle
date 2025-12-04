import React from 'react';
import { useAppStore } from '../store/appStore';
import { Calendar, Clock, Inbox, CheckCircle, Filter, CheckSquare } from 'lucide-react';

interface QuickFiltersProps {
  bulkMode?: boolean;
  onBulkModeChange?: (bulkMode: boolean) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({ 
  bulkMode = false, 
  onBulkModeChange 
}) => {
  
  const { 
    getTodayTasks, 
    getUpcomingTasks, 
    getOverdueTasks, 
    getInboxTasks,
    getCompletedTasks,
    currentView,
    setCurrentView,
    selectedTaskIds,
    clearSelectedTasks
  } = useAppStore();

  const todayCount = getTodayTasks().length;
  const upcomingCount = getUpcomingTasks(7).length;
  const overdueCount = getOverdueTasks().length;
  const inboxCount = getInboxTasks().length;
  const completedCount = getCompletedTasks().length;

  const toggleBulkMode = () => {
    if (bulkMode) {
      clearSelectedTasks();
    }
    onBulkModeChange?.(!bulkMode);
  };

  const filters = [
    {
      id: 'today',
      label: 'Today',
      icon: Calendar,
      count: todayCount,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      active: currentView === 'today',
      onClick: () => setCurrentView('today')
    },
    {
      id: 'upcoming',
      label: 'This Week',
      icon: Clock,
      count: upcomingCount,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      active: currentView === 'upcoming',
      onClick: () => setCurrentView('upcoming')
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: Clock,
      count: overdueCount,
      color: 'text-red-600 bg-red-50 border-red-200',
      active: false, // This is a filter, not a view
      onClick: () => {
        // This would trigger an overdue filter in the current view
        // For now, we'll just go to today view where overdue tasks are shown
        setCurrentView('today');
      }
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      count: inboxCount,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      active: currentView === 'inbox',
      onClick: () => setCurrentView('inbox')
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: completedCount,
      color: 'text-green-600 bg-green-50 border-green-200',
      active: currentView === 'completed',
      onClick: () => setCurrentView('completed')
    }
  ];

  return (
    <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
      <div className="flex items-center gap-1 text-sm text-gray-600 mr-2">
        <Filter className="h-4 w-4" />
        <span className="hidden md:inline">Quick Filters:</span>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {/* Bulk Mode Toggle */}
        <button
          onClick={toggleBulkMode}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium
            transition-all duration-200 whitespace-nowrap touch-target
            ${bulkMode 
              ? 'text-primary-600 bg-primary-50 border-primary-200' 
              : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
            }
          `}
          title="Toggle bulk selection mode"
        >
          <CheckSquare className="h-4 w-4" />
          <span>Bulk Select</span>
          {selectedTaskIds.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              {selectedTaskIds.length}
            </span>
          )}
        </button>
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={filter.onClick}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium
                transition-all duration-200 whitespace-nowrap touch-target
                ${filter.active 
                  ? `${filter.color} shadow-sm` 
                  : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
              title={`${filter.label}: ${filter.count} tasks`}
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>
              {filter.count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs font-medium
                  ${filter.active ? 'bg-white bg-opacity-70' : 'bg-gray-100 text-gray-700'}
                `}>
                  {filter.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
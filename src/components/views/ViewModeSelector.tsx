import React from 'react';
import { List, LayoutGrid, Calendar } from 'lucide-react';

type ViewMode = 'list' | 'board' | 'calendar';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  const viewModes = [
    { id: 'list', label: 'List', icon: List, description: 'Traditional task list' },
    { id: 'board', label: 'Board', icon: LayoutGrid, description: 'Kanban-style columns' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Monthly calendar view' }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id as ViewMode)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${currentMode === mode.id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={mode.description}
        >
          <mode.icon className="h-4 w-4" />
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};
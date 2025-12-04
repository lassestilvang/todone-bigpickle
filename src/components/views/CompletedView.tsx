import React, { useState, memo } from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import { BoardView } from '../tasks/BoardView';
import { CalendarView } from '../tasks/CalendarView';
import { DragDropProvider } from '../dnd/DragDropProvider';
import { ViewModeSelector } from './ViewModeSelector';

type ViewMode = 'list' | 'board' | 'calendar';

interface CompletedViewProps {
  bulkMode?: boolean;
}

export const CompletedView: React.FC<CompletedViewProps> = memo(({ bulkMode = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { getCompletedTasks } = useAppStore();
  const tasks = getCompletedTasks();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Completed Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} completed
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No completed tasks
            </h3>
            <p className="text-sm text-gray-500">
              Complete some tasks to see them here
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <DragDropProvider tasks={tasks}>
                <div className="p-4 space-y-1">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} bulkMode={bulkMode} />
                  ))}
                </div>
              </DragDropProvider>
            )}
            
            {viewMode === 'board' && (
              <BoardView
                tasks={tasks}
                title="Completed"
                groupBy="priority"
              />
            )}
            
            {viewMode === 'calendar' && (
              <CalendarView
                tasks={tasks}
                title="Completed"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});
import React, { useState, memo } from 'react';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import { BoardView } from '../tasks/BoardView';
import { CalendarView } from '../tasks/CalendarView';
import { DragDropProvider } from '../dnd/DragDropProvider';
import { ListSkeleton } from '../Skeleton';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { ViewModeSelector } from './ViewModeSelector';

type ViewMode = 'list' | 'board' | 'calendar';

interface InboxViewProps {
  bulkMode?: boolean;
}

export const InboxView: React.FC<InboxViewProps> = memo(({ bulkMode = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { getInboxTasks, createTask, isLoading } = useAppStore();
  const tasks = getInboxTasks();

  // Show skeleton while loading
  if (isLoading) {
    return <ListSkeleton items={8} />;
  }

  const handleQuickAdd = async (content: string) => {
    if (!content.trim()) return;

    try {
      await createTask({
        content: content.trim(),
        priority: 'p4',
        labels: [],
        order: 0,
        isCompleted: false
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Inbox</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} to process
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={setViewMode}
            />
            <button className="btn btn-ghost px-3 py-2 text-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="btn btn-ghost px-3 py-2 text-sm">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your inbox is empty
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Tasks without a project will appear here
            </p>
            <button 
              onClick={() => {
                const element = document.querySelector('[data-quick-add]') as HTMLElement;
                element?.click();
              }}
              className="btn btn-primary"
            >
              Add your first task
            </button>
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
                title="Inbox"
                groupBy="priority"
              />
            )}
            
            {viewMode === 'calendar' && (
              <CalendarView
                tasks={tasks}
                title="Inbox"
              />
            )}
          </>
        )}
      </div>

      {/* Quick Add Bar */}
      <div className="px-6 py-4 border-t border-gray-200" data-quick-add>
        <div className="flex items-center gap-3">
          <Plus className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Add a task to inbox..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleQuickAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
});
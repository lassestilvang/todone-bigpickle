import React from 'react';
import { useAppStore } from '../../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import { Plus, Filter, SortAsc } from 'lucide-react';

export const InboxView: React.FC = () => {
  const { getInboxTasks, createTask, user } = useAppStore();
  const tasks = getInboxTasks();

  const handleQuickAdd = async (content: string) => {
    if (!content.trim()) return;

    try {
      await createTask({
        content: content.trim(),
        priority: 'p4',
        labels: [],
        order: 0,
        isCompleted: false,
        ownerId: user?.id || ''
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
              onClick={() => document.querySelector('[data-quick-add]')?.click()}
              className="btn btn-primary"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
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
};
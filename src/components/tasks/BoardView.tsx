import React, { useState } from 'react';
import { TaskItem } from './TaskItem';
import type { Task } from '../../types';
import { GripVertical, Plus } from 'lucide-react';

interface BoardViewProps {
  tasks: Task[];
  title: string;
  groupBy?: 'priority' | 'project' | 'none';
  emptyMessage?: string;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  title,
  groupBy = 'priority',
  emptyMessage = 'No tasks to display'
}) => {
  const [columns, setColumns] = useState<any[]>([]);

  React.useEffect(() => {
    if (groupBy === 'none') {
      setColumns([{ id: 'default', title: 'Tasks', tasks }]);
      return;
    }

    let grouped: any = {};

    switch (groupBy) {
      case 'priority':
        grouped = {
          p1: { id: 'p1', title: 'Priority 1', tasks: [], color: '#ef4444' },
          p2: { id: 'p2', title: 'Priority 2', tasks: [], color: '#f97316' },
          p3: { id: 'p3', title: 'Priority 3', tasks: [], color: '#3b82f6' },
          p4: { id: 'p4', title: 'No Priority', tasks: [], color: '#6b7280' }
        };
        tasks.forEach(task => {
          if (grouped[task.priority]) {
            grouped[task.priority].tasks.push(task);
          }
        });
        break;

      case 'project':
        // Group by project (simplified for now)
        grouped = {
          inbox: { id: 'inbox', title: 'Inbox', tasks: [], color: '#6b7280' }
        };
        tasks.forEach(task => {
          const projectId = task.projectId || 'inbox';
          if (!grouped[projectId]) {
            grouped[projectId] = {
              id: projectId,
              title: projectId === 'inbox' ? 'Inbox' : `Project ${projectId}`,
              tasks: [],
              color: '#10b981'
            };
          }
          grouped[projectId].tasks.push(task);
        });
        break;
    }

    setColumns(Object.values(grouped));
  }, [tasks, groupBy]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => {
                // This would be handled by parent component
                console.log('Group by:', e.target.value);
              }}
              className="input text-sm py-1"
            >
              <option value="none">None</option>
              <option value="priority">Priority</option>
              <option value="project">Project</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-6">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyMessage}
              </h3>
              <p className="text-sm">
                Try adjusting your filters or create new tasks
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-full overflow-x-auto">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-1 min-w-80 bg-gray-50 rounded-lg p-4"
                style={{ minWidth: '320px' }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {column.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <h3 className="font-medium text-gray-900">
                      {column.title}
                    </h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Tasks */}
                <div className="space-y-2 min-h-[200px]">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No tasks in this column</p>
                    </div>
                  ) : (
                    column.tasks.map((task: Task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-md border border-gray-200 hover:shadow-sm transition-shadow cursor-move"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <TaskItem task={task} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { useAppStore } from '../store/simpleStore';

export const TestAppComponent: React.FC = () => {
  const { tasks, createTask } = useAppStore();

  const handleAddTask = async () => {
    await createTask({
      id: `task-${Date.now()}`,
      content: 'Test task from TestApp',
      priority: 'p4',
      labels: [],
      order: 0,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-8">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Test App - No Authentication</h1>
        <p className="text-gray-600">Tasks: {tasks.length}</p>
        <button 
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => {/* Will be implemented */}}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}>
                    {task.content}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
import React from 'react';
import { useAppStore } from '../store/simpleStore';

export const App: React.FC = () => {
  const tasks = useTasks();
  const { createTask } = useTaskActions();

  const handleAddTask = async () => {
    await createTask({
      content: 'Test task',
      priority: 'p4',
      labels: [],
      order: 0,
      isCompleted: false
    });
  };

  return (
    <div>
      <h1>Simple Test App</h1>
      <p>Tasks: {tasks.length}</p>
      <button onClick={handleAddTask}>Add Task</button>
      {tasks.map(task => (
        <div key={task.id}>
          {task.content} - {task.isCompleted ? '✓' : '○'}
        </div>
      ))}
    </div>
  );
};
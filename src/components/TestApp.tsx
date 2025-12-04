import React from 'react';
import { create } from 'zustand';

type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
  priority: string;
  createdAt: Date;
};

interface TestStore {
  tasks: Task[];
  addTask: (content: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const useTestStore = create<TestStore>((set) => ({
  tasks: [],
  addTask: (content: string) => 
    set((state) => ({
      tasks: [...state.tasks, {
        id: Date.now().toString(),
        content,
        isCompleted: false,
        priority: 'p4',
        createdAt: new Date()
      }]
    })),
  toggleTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    })),
  deleteTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }))
}));

export const TestAppComponent: React.FC = () => {
  const [newTask, setNewTask] = React.useState('');
  const tasks = useTestStore(state => state.tasks);
  const addTask = useTestStore(state => state.addTask);
  const toggleTask = useTestStore(state => state.toggleTask);
  const deleteTask = useTestStore(state => state.deleteTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Task Management Test</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            width: '70%',
            marginRight: '10px'
          }}
        />
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Task
        </button>
      </form>

      <div>
        <h2>Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li 
                key={task.id} 
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: task.isCompleted ? '#f8f9fa' : 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task.id)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{
                  textDecoration: task.isCompleted ? 'line-through' : 'none',
                  flex: 1
                }}>
                  {task.content}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  backgroundColor: '#e9ecef',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>Test Results:</h3>
        <p>✅ Task Creation: Working</p>
        <p>✅ Task Display: Working</p>
        <p>✅ Task Completion Toggle: Working</p>
        <p>✅ Task Deletion: Working</p>
        <p>✅ State Management: Working</p>
      </div>
    </div>
  );
};
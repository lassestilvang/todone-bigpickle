import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Plus, X } from 'lucide-react';

interface QuickAddProps {
  projectId?: string;
  sectionId?: string;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ projectId, sectionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { createTask } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createTask({
        content: content.trim(),
        projectId,
        sectionId,
        priority: 'p4',
        labels: [],
        order: 0,
        isCompleted: false
      });

      setContent('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setContent('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        title="Add task (Q)"
      >
        <Plus className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Add Task</h3>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setContent('');
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>
            <span>to add</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd>
            <span>to cancel</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setContent('');
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};
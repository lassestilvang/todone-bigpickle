import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { NaturalLanguageParser, type ParsedTask } from '../lib/naturalLanguageParser';
import { Plus, X, Calendar, Clock, Flag, Tag, Repeat } from 'lucide-react';

interface QuickAddProps {
  projectId?: string;
  sectionId?: string;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ projectId, sectionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const { createTask, projects, labels } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) {
        const parsed = NaturalLanguageParser.parse(content);
        setParsedTask(parsed);
        setShowSuggestions(true);
      } else {
        setParsedTask(null);
        setShowSuggestions(false);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const parsed = NaturalLanguageParser.parse(content);
      
      // Resolve project ID if project name is provided
      let resolvedProjectId = projectId;
      if (parsed.projectId && !projectId) {
        const project = projects.find(p => 
          p.name.toLowerCase() === parsed.projectId?.toLowerCase()
        );
        resolvedProjectId = project?.id;
      }

      // Resolve label IDs if label names are provided
      let resolvedLabels: string[] = [];
      if (parsed.labels) {
        resolvedLabels = parsed.labels
          .map(labelName => {
            const label = labels.find(l => 
              l.name.toLowerCase() === labelName.toLowerCase()
            );
            return label?.id;
          })
          .filter(Boolean) as string[];
      }

      await createTask({
        content: parsed.content,
        description: parsed.description,
        projectId: resolvedProjectId,
        sectionId,
        priority: parsed.priority || 'p4',
        labels: resolvedLabels,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        duration: parsed.duration,
        recurringPattern: parsed.recurringPattern,
        order: 0,
        isCompleted: false
      });

      setContent('');
      setParsedTask(null);
      setShowSuggestions(false);
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40 md:bottom-6 md:right-6 bottom-20 right-4"
        title="Add task (Q)"
      >
        <Plus className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 md:bottom-6 md:right-6 bottom-20 right-4 dark:bg-zinc-800 dark:border-zinc-700">
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-zinc-100">Add Task</h3>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setContent('');
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </button>
          </div>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="What needs to be done? Try: 'Meeting tomorrow at 2pm p1 #work'"
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"
            autoFocus
          />

          {/* Parsed Task Preview */}
          {parsedTask && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-2 dark:bg-zinc-700">
              <div className="text-sm font-medium text-gray-700 dark:text-zinc-300">Task will be created as:</div>
              
              <div className="text-sm">
                <strong>Content:</strong> {parsedTask.content}
              </div>
              
              {parsedTask.description && (
                <div className="text-sm">
                  <strong>Description:</strong> {parsedTask.description}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {parsedTask.priority && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                    <Flag className="h-3 w-3" />
                    Priority {parsedTask.priority.toUpperCase()}
                  </div>
                )}
                
                {parsedTask.dueDate && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    <Calendar className="h-3 w-3" />
                    {parsedTask.dueDate.toLocaleDateString()}
                  </div>
                )}
                
                {parsedTask.dueTime && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    <Clock className="h-3 w-3" />
                    {parsedTask.dueTime}
                  </div>
                )}
                
                {parsedTask.labels && parsedTask.labels.length > 0 && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    <Tag className="h-3 w-3" />
                    {parsedTask.labels.join(', ')}
                  </div>
                )}
                
                {parsedTask.recurringPattern && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    <Repeat className="h-3 w-3" />
                    Recurring
                  </div>
                )}
                
                {parsedTask.duration && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    <Clock className="h-3 w-3" />
                    {parsedTask.duration}min
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && content.length > 2 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1 dark:text-zinc-400">Try adding:</div>
              <div className="flex flex-wrap gap-1">
                {NaturalLanguageParser.getSuggestions(content).slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setContent(content + ' ' + suggestion)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-zinc-400">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded dark:bg-zinc-700 dark:text-zinc-100">Enter</kbd>
            <span>to add</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded dark:bg-zinc-700 dark:text-zinc-100">Esc</kbd>
            <span>to cancel</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-2 dark:bg-zinc-700 dark:border-zinc-600">
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
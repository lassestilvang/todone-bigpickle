import React from 'react';
import { useAppKeyboardShortcuts } from '../lib/keyboardShortcuts';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const shortcuts = useAppKeyboardShortcuts();

  if (!isOpen) return null;

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = getCategory(shortcut.description);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, typeof shortcuts>);

  function getCategory(description: string): string {
    if (description.includes('Go to')) return 'Navigation';
    if (description.includes('Task')) return 'Task Management';
    if (description.includes('Priority')) return 'Priority';
    if (description.includes('Show') || description.includes('Toggle')) return 'View Controls';
    if (description.includes('Global')) return 'Global Shortcuts';
    return 'Other';
  }

  const formatShortcut = (shortcut: typeof shortcuts[0]) => {
    const parts = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Most shortcuts work only when not typing in text fields</li>
              <li>• Global shortcuts (like Cmd/Ctrl+K) work anywhere</li>
              <li>• Press Escape to deselect tasks or close modals</li>
              <li>• Use Alt+1-4 to quickly set task priorities</li>
              <li>• Press ? to show this help dialog anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
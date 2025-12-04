import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  global?: boolean; // Whether it works anywhere or only in specific contexts
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Only allow global shortcuts when typing
        const globalShortcuts = shortcuts.filter(s => s.global);
        const matchingShortcut = globalShortcuts.find(shortcut => {
          return (
            e.key.toLowerCase() === shortcut.key.toLowerCase() &&
            !!shortcut.ctrlKey === e.ctrlKey &&
            !!shortcut.metaKey === e.metaKey &&
            !!shortcut.shiftKey === e.shiftKey &&
            !!shortcut.altKey === e.altKey
          );
        });

        if (matchingShortcut) {
          e.preventDefault();
          matchingShortcut.action();
        }
        return;
      }

      // Check all shortcuts for non-input contexts
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!shortcut.ctrlKey === e.ctrlKey &&
          !!shortcut.metaKey === e.metaKey &&
          !!shortcut.shiftKey === e.shiftKey &&
          !!shortcut.altKey === e.altKey
        );
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const useAppKeyboardShortcuts = (openCommandPalette?: () => void) => {
  const {
    setCurrentView,
    toggleSidebar,
    setSelectedTask,
    selectedTaskId,
    toggleShowCompleted,
    getTodayTasks,
    getOverdueTasks,
    getInboxTasks,
    tasks
  } = useAppStore();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'g',
      shiftKey: true,
      action: () => setCurrentView('inbox'),
      description: 'Go to Inbox',
    },
    {
      key: 't',
      shiftKey: true,
      action: () => setCurrentView('today'),
      description: 'Go to Today',
    },
    {
      key: 'u',
      shiftKey: true,
      action: () => setCurrentView('upcoming'),
      description: 'Go to Upcoming',
    },
    {
      key: 'p',
      shiftKey: true,
      action: () => setCurrentView('projects'),
      description: 'Go to Projects',
    },
    {
      key: 'l',
      shiftKey: true,
      action: () => setCurrentView('labels'),
      description: 'Go to Labels',
    },
    {
      key: 'f',
      shiftKey: true,
      action: () => setCurrentView('filters'),
      description: 'Go to Filters',
    },

    // Task Management
    {
      key: 'n',
      action: () => {
        // Trigger quick add
        const quickAddButton = document.querySelector('[title="Add task (Q)"]') as HTMLButtonElement;
        quickAddButton?.click();
      },
      description: 'New Task',
    },
    {
      key: 'q',
      action: () => {
        // Trigger quick add
        const quickAddButton = document.querySelector('[title="Add task (Q)"]') as HTMLButtonElement;
        quickAddButton?.click();
      },
      description: 'Quick Add Task',
    },
    {
      key: 'Enter',
      action: () => {
        if (selectedTaskId) {
          // Toggle task completion
          const taskCheckbox = document.querySelector(`[data-task-id="${selectedTaskId}"] input[type="checkbox"]`) as HTMLInputElement;
          taskCheckbox?.click();
        }
      },
      description: 'Toggle Task Complete',
    },
    {
      key: 'Delete',
      action: () => {
        if (selectedTaskId) {
          // Delete selected task
          const deleteButton = document.querySelector(`[data-task-id="${selectedTaskId}"] [data-action="delete"]`) as HTMLButtonElement;
          deleteButton?.click();
        }
      },
      description: 'Delete Selected Task',
    },
    {
      key: 'e',
      action: () => {
        if (selectedTaskId) {
          // Edit selected task
          const editButton = document.querySelector(`[data-task-id="${selectedTaskId}"] [data-action="edit"]`) as HTMLButtonElement;
          editButton?.click();
        }
      },
      description: 'Edit Selected Task',
    },

    // View Controls
    {
      key: 'h',
      action: () => toggleSidebar(),
      description: 'Toggle Sidebar',
    },
    {
      key: 'c',
      shiftKey: true,
      action: () => toggleShowCompleted(),
      description: 'Toggle Completed Tasks',
    },
    {
      key: 'Escape',
      action: () => {
        // Deselect task or close modals
        setSelectedTask(null);
        
        // Close any open modals
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLButtonElement;
          closeButton?.click();
        });
      },
      description: 'Deselect Task / Close Modal',
    },

    // Quick Filters
    {
      key: '1',
      action: () => {
        // Filter to today's tasks
        const todayTasks = getTodayTasks();
        console.log('Today tasks:', todayTasks.length);
      },
      description: 'Show Today Tasks',
    },
    {
      key: '2',
      action: () => {
        // Filter to overdue tasks
        const overdueTasks = getOverdueTasks();
        console.log('Overdue tasks:', overdueTasks.length);
      },
      description: 'Show Overdue Tasks',
    },
    {
      key: '3',
      action: () => {
        // Filter to inbox tasks
        const inboxTasks = getInboxTasks();
        console.log('Inbox tasks:', inboxTasks.length);
      },
      description: 'Show Inbox Tasks',
    },

    // Global shortcuts (work even in inputs)
    {
      key: 'k',
      ctrlKey: true,
      metaKey: false,
      action: () => {
        // Open command palette
        openCommandPalette?.();
      },
      description: 'Open Command Palette',
      global: true,
    },
    {
      key: 'k',
      ctrlKey: false,
      metaKey: true,
      action: () => {
        // Open command palette (Mac)
        openCommandPalette?.();
      },
      description: 'Open Command Palette (Mac)',
      global: true,
    },
    {
      key: '/',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        // Focus search
        const searchButton = document.querySelector('[title*="Search"]') as HTMLButtonElement;
        searchButton?.click();
      },
      description: 'Focus Search',
      global: true,
    },

    // Priority shortcuts
    {
      key: '1',
      altKey: true,
      action: () => {
        if (selectedTaskId) {
          // Set priority to P1
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            const { updateTask } = useAppStore.getState();
            updateTask(selectedTaskId, { priority: 'p1' });
          }
        }
      },
      description: 'Set Priority P1',
    },
    {
      key: '2',
      altKey: true,
      action: () => {
        if (selectedTaskId) {
          // Set priority to P2
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            const { updateTask } = useAppStore.getState();
            updateTask(selectedTaskId, { priority: 'p2' });
          }
        }
      },
      description: 'Set Priority P2',
    },
    {
      key: '3',
      altKey: true,
      action: () => {
        if (selectedTaskId) {
          // Set priority to P3
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            const { updateTask } = useAppStore.getState();
            updateTask(selectedTaskId, { priority: 'p3' });
          }
        }
      },
      description: 'Set Priority P3',
    },
    {
      key: '4',
      altKey: true,
      action: () => {
        if (selectedTaskId) {
          // Set priority to P4
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task) {
            const { updateTask } = useAppStore.getState();
            updateTask(selectedTaskId, { priority: 'p4' });
          }
        }
      },
      description: 'Set Priority P4',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};
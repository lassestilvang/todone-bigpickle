import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Palette, 
  Database,
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Keyboard,
  BarChart3,
  Eye
} from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'data' | 'keyboard' | 'productivity' | 'accessibility'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  
  const { 
    user,
    updateUserSettings
  } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    theme: theme || 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY' as const,
    timeFormat: '12h' as const,
    startOfWeek: 'sunday' as const,
    notifications: {
      taskReminders: true,
      comments: true,
      assignments: true,
      dailySummary: false,
      overdueTasks: true,
      goalAchievements: true,
      emailNotifications: false,
      pushNotifications: true,
      soundEnabled: true,
      reminderTiming: '15min' as const,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    preferences: {
      defaultProject: '',
      defaultPriority: 'p3' as const,
      autoAddTime: false,
      showCompleted: true,
      collapseSections: false,
      compactMode: false,
      showAnimations: true,
      autoSave: true,
      confirmDelete: true
    },
    keyboard: {
      enabled: true,
      shortcuts: {
        quickAdd: 'mod+k',
        search: 'mod+f',
        toggleComplete: 'mod+enter',
        newTask: 'mod+n',
        settings: 'mod+,',
        today: 'mod+t',
        inbox: 'mod+i'
      }
    },
    productivity: {
      dailyGoal: 5,
      weeklyGoal: 25,
      timeTracking: true,
      pomodoroTimer: 25,
      breakTime: 5,
      analyticsEnabled: true,
      focusMode: false,
      distractionBlocking: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusVisible: true
    },
    privacy: {
      analytics: false,
      crashReporting: true,
      usageData: false,
      locationTracking: false
    }
  });

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSave = async () => {
    try {
      if (user) {
        await updateUserSettings({
          ...user.settings,
          ...settings,
          theme: settings.theme
        });
      }
      setTheme(settings.theme);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        startOfWeek: 'sunday',
        notifications: {
          taskReminders: true,
          comments: true,
          assignments: true,
          dailySummary: false,
          overdueTasks: true,
          goalAchievements: true,
          emailNotifications: false,
          pushNotifications: true,
          soundEnabled: true,
          reminderTiming: '15min',
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
          }
        },
        preferences: {
          defaultProject: '',
          defaultPriority: 'p3',
          autoAddTime: false,
          showCompleted: true,
          collapseSections: false,
          compactMode: false,
          showAnimations: true,
          autoSave: true,
          confirmDelete: true
        },
        keyboard: {
          enabled: true,
          shortcuts: {
            quickAdd: 'mod+k',
            search: 'mod+f',
            toggleComplete: 'mod+enter',
            newTask: 'mod+n',
            settings: 'mod+,',
            today: 'mod+t',
            inbox: 'mod+i'
          }
        },
        productivity: {
          dailyGoal: 5,
          weeklyGoal: 25,
          timeTracking: true,
          pomodoroTimer: 25,
          breakTime: 5,
          analyticsEnabled: true,
          focusMode: false,
          distractionBlocking: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          screenReader: false,
          keyboardNavigation: true,
          focusVisible: true
        },
        privacy: {
          analytics: false,
          crashReporting: true,
          usageData: false,
          locationTracking: false
        }
      });
      setHasChanges(true);
    }
  };

  const handleExportData = async () => {
    try {
      setExportStatus('Exporting...');
      const { tasks, projects, labels, filters, user } = useAppStore.getState();
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user,
        tasks,
        projects,
        labels,
        filters
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todone-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportStatus('Export successful!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch {
      setExportStatus('Export failed');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Importing...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          
          // Validate import data structure
          if (!importData.version || !importData.tasks) {
            throw new Error('Invalid backup file');
          }
          
          // Import data to database
          const { db } = await import('../lib/database');
          
          if (importData.tasks) {
            await db.tasks.clear();
            await db.tasks.bulkAdd(importData.tasks);
          }
          
          if (importData.projects) {
            await db.projects.clear();
            await db.projects.bulkAdd(importData.projects);
          }
          
          if (importData.labels) {
            await db.labels.clear();
            await db.labels.bulkAdd(importData.labels);
          }
          
          if (importData.filters) {
            await db.filters.clear();
            await db.filters.bulkAdd(importData.filters);
          }
          
          // Reload store data
          const store = useAppStore.getState();
          await store.loadTasks();
          await store.loadProjects();
          await store.loadLabels();
          await store.loadFilters();
          
          setImportStatus('Import successful!');
          setTimeout(() => setImportStatus(''), 3000);
        } catch {
          setImportStatus('Import failed: Invalid file');
          setTimeout(() => setImportStatus(''), 3000);
        }
      };
      reader.readAsText(file);
    } catch {
      setImportStatus('Import failed');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const updateSetting = (path: string, value: unknown) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: Record<string, unknown> = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (key && typeof key === 'string' && key in current) {
        current = current[key] as Record<string, unknown>;
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey && typeof lastKey === 'string' && lastKey in current) {
      current[lastKey] = value;
    }
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'productivity', label: 'Productivity', icon: BarChart3 },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'data', label: 'Data & Storage', icon: Database }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col dark:bg-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Settings</h2>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="btn btn-primary px-3 py-2 text-sm flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'general' | 'notifications' | 'appearance' | 'data' | 'keyboard' | 'productivity' | 'accessibility')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 dark:bg-zinc-800">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-zinc-100">General</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="input w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => updateSetting('dateFormat', e.target.value)}
                        className="input w-full"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                        Time Format
                      </label>
                      <select
                        value={settings.timeFormat}
                        onChange={(e) => updateSetting('timeFormat', e.target.value)}
                        className="input w-full"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                        Start of Week
                      </label>
                      <select
                        value={settings.startOfWeek}
                        onChange={(e) => updateSetting('startOfWeek', e.target.value)}
                        className="input w-full"
                      >
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                        Default Priority
                      </label>
                      <select
                        value={settings.preferences.defaultPriority}
                        onChange={(e) => updateSetting('preferences.defaultPriority', e.target.value)}
                        className="input w-full"
                      >
                        <option value="p1">Priority 1 (Urgent)</option>
                        <option value="p2">Priority 2 (High)</option>
                        <option value="p3">Priority 3 (Medium)</option>
                        <option value="p4">Priority 4 (Low)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.autoAddTime}
                          onChange={(e) => updateSetting('preferences.autoAddTime', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Automatically add time to new tasks</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.showCompleted}
                          onChange={(e) => updateSetting('preferences.showCompleted', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show completed tasks by default</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.collapseSections}
                          onChange={(e) => updateSetting('preferences.collapseSections', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Collapse sections by default</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.compactMode}
                          onChange={(e) => updateSetting('preferences.compactMode', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Compact mode</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.showAnimations}
                          onChange={(e) => updateSetting('preferences.showAnimations', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show animations</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.autoSave}
                          onChange={(e) => updateSetting('preferences.autoSave', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Auto-save changes</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.preferences.confirmDelete}
                          onChange={(e) => updateSetting('preferences.confirmDelete', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Confirm before deleting</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.notifications).filter(([key]) => 
                        typeof settings.notifications[key as keyof typeof settings.notifications] === 'boolean'
                      ).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => updateSetting(`notifications.${key}`, e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Reminder Timing</h4>
                    <select
                      value={settings.notifications.reminderTiming}
                      onChange={(e) => updateSetting('notifications.reminderTiming', e.target.value)}
                      className="input w-full"
                    >
                      <option value="5min">5 minutes before</option>
                      <option value="15min">15 minutes before</option>
                      <option value="30min">30 minutes before</option>
                      <option value="1hour">1 hour before</option>
                      <option value="1day">1 day before</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quiet Hours</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.quietHours.enabled}
                          onChange={(e) => updateSetting('notifications.quietHours.enabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable quiet hours</span>
                      </label>
                      
                      {settings.notifications.quietHours.enabled && (
                        <div className="flex gap-3 items-center">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Start</label>
                            <input
                              type="time"
                              value={settings.notifications.quietHours.start}
                              onChange={(e) => updateSetting('notifications.quietHours.start', e.target.value)}
                              className="input w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">End</label>
                            <input
                              type="time"
                              value={settings.notifications.quietHours.end}
                              onChange={(e) => updateSetting('notifications.quietHours.end', e.target.value)}
                              className="input w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', description: 'Clean and bright' },
                      { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
                      { value: 'system', label: 'System', description: 'Follow your OS' }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => updateSetting('theme', themeOption.value)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          settings.theme === themeOption.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{themeOption.label}</div>
                        <div className="text-sm text-gray-500">{themeOption.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Settings */}
            {activeTab === 'keyboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Keyboard Shortcuts</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.keyboard.enabled}
                      onChange={(e) => updateSetting('keyboard.enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Enable keyboard shortcuts</span>
                  </div>

                  {settings.keyboard.enabled && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Shortcut Keys</h4>
                      {Object.entries(settings.keyboard.shortcuts).map(([action, shortcut]) => (
                        <div key={action} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">
                            {action.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <input
                            type="text"
                            value={shortcut}
                            onChange={(e) => updateSetting(`keyboard.shortcuts.${action}`, e.target.value)}
                            className="input w-32 text-sm"
                            placeholder="e.g., mod+k"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Productivity Settings */}
            {activeTab === 'productivity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity & Goals</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Daily & Weekly Goals</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                          Daily Tasks Goal
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={settings.productivity.dailyGoal}
                          onChange={(e) => updateSetting('productivity.dailyGoal', parseInt(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                          Weekly Tasks Goal
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={settings.productivity.weeklyGoal}
                          onChange={(e) => updateSetting('productivity.weeklyGoal', parseInt(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Pomodoro Timer</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                          Focus Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={settings.productivity.pomodoroTimer}
                          onChange={(e) => updateSetting('productivity.pomodoroTimer', parseInt(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-zinc-300">
                          Break Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={settings.productivity.breakTime}
                          onChange={(e) => updateSetting('productivity.breakTime', parseInt(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.productivity.timeTracking}
                          onChange={(e) => updateSetting('productivity.timeTracking', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable time tracking</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.productivity.analyticsEnabled}
                          onChange={(e) => updateSetting('productivity.analyticsEnabled', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Show productivity analytics</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.productivity.focusMode}
                          onChange={(e) => updateSetting('productivity.focusMode', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable focus mode</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.productivity.distractionBlocking}
                          onChange={(e) => updateSetting('productivity.distractionBlocking', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Block distractions during focus time</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.highContrast}
                        onChange={(e) => updateSetting('accessibility.highContrast', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">High contrast mode</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.largeText}
                        onChange={(e) => updateSetting('accessibility.largeText', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Large text</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.reducedMotion}
                        onChange={(e) => updateSetting('accessibility.reducedMotion', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Reduced motion</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.screenReader}
                        onChange={(e) => updateSetting('accessibility.screenReader', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Screen reader support</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.keyboardNavigation}
                        onChange={(e) => updateSetting('accessibility.keyboardNavigation', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Enhanced keyboard navigation</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.accessibility.focusVisible}
                        onChange={(e) => updateSetting('accessibility.focusVisible', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Always show focus indicator</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Storage Settings */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Storage</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your data is stored locally in your browser using IndexedDB.
                    </p>
                    <div className="text-sm text-gray-500">
                      <div>Tasks: ~1KB per task</div>
                      <div>Projects: ~100B per project</div>
                      <div>Labels: ~50B per label</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <button 
                        onClick={handleExportData}
                        className="btn btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Data
                      </button>
                      {exportStatus && (
                        <p className={`text-xs mt-1 ${exportStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                          {exportStatus}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Import Data
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                      {importStatus && (
                        <p className={`text-xs mt-1 ${importStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                          {importStatus}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Privacy Settings</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.privacy.analytics}
                            onChange={(e) => updateSetting('privacy.analytics', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Share analytics data</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.privacy.crashReporting}
                            onChange={(e) => updateSetting('privacy.crashReporting', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Automatic crash reporting</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.privacy.usageData}
                            onChange={(e) => updateSetting('privacy.usageData', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Share usage statistics</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.privacy.locationTracking}
                            onChange={(e) => updateSetting('privacy.locationTracking', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Location-based reminders</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <button 
                        onClick={handleReset}
                        className="btn btn-danger w-full"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
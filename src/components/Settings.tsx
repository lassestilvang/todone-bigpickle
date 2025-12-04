import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { 
  User, 
  Bell, 
  Palette, 
  Database,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'appearance' | 'data'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  
  const { 
    user,
    theme,
    setTheme,
    updateUserSettings
  } = useAppStore();

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
      goalAchievements: true
    },
    preferences: {
      defaultProject: '',
      defaultPriority: 'p3' as const,
      autoAddTime: false,
      showCompleted: true,
      collapseSections: false
    }
  });

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
          goalAchievements: true
        },
        preferences: {
          defaultProject: '',
          defaultPriority: 'p3',
          autoAddTime: false,
          showCompleted: true,
          collapseSections: false
        }
      });
      setHasChanges(true);
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
    { id: 'data', label: 'Data & Storage', icon: Database }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
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
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'general' | 'notifications' | 'appearance' | 'data')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
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
          <div className="flex-1 overflow-auto p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
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
                    <button className="btn btn-secondary w-full">
                      Export Data
                    </button>
                    <button className="btn btn-secondary w-full">
                      Import Data
                    </button>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
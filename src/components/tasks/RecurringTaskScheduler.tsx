import React, { useState } from 'react';
import { Calendar, X, Trash2 } from 'lucide-react';
import type { RecurringPattern } from '../../types';

interface RecurringTaskSchedulerProps {
  pattern?: RecurringPattern;
  onSave: (pattern: RecurringPattern | undefined) => void;
  onCancel: () => void;
}

export const RecurringTaskScheduler: React.FC<RecurringTaskSchedulerProps> = ({
  pattern,
  onSave,
  onCancel,
}) => {
  const [localPattern, setLocalPattern] = useState<RecurringPattern>(
    pattern || {
      type: 'daily',
      interval: 1,
    }
  );

  const patternTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ] as const;

  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const handleSave = () => {
    onSave(localPattern);
  };

  const handleRemove = () => {
    onSave(undefined);
  };

  const toggleWeekDay = (day: number) => {
    setLocalPattern(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...(prev.daysOfWeek || []), day].sort(),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Recurring Task</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Repeat Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat
            </label>
            <select
              value={localPattern.type}
              onChange={(e) => setLocalPattern(prev => ({
                ...prev,
                type: e.target.value as RecurringPattern['type'],
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {patternTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={localPattern.interval}
                onChange={(e) => setLocalPattern(prev => ({
                  ...prev,
                  interval: Math.max(1, parseInt(e.target.value) || 1),
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-600">
                {localPattern.type === 'daily' && 'day(s)'}
                {localPattern.type === 'weekly' && 'week(s)'}
                {localPattern.type === 'monthly' && 'month(s)'}
                {localPattern.type === 'yearly' && 'year(s)'}
                {localPattern.type === 'custom' && 'period(s)'}
              </span>
            </div>
          </div>

          {/* Days of Week (for weekly) */}
          {localPattern.type === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On these days
              </label>
              <div className="flex gap-1">
                {weekDays.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleWeekDay(day.value)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      localPattern.daysOfWeek?.includes(day.value)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {localPattern.type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={localPattern.dayOfMonth || 1}
                onChange={(e) => setLocalPattern(prev => ({
                  ...prev,
                  dayOfMonth: Math.max(1, Math.min(31, parseInt(e.target.value) || 1)),
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End (optional)
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={localPattern.endDate ? localPattern.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalPattern(prev => ({
                    ...prev,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Occurrences"
                  value={localPattern.count || ''}
                  onChange={(e) => setLocalPattern(prev => ({
                    ...prev,
                    count: e.target.value ? parseInt(e.target.value) : undefined,
                  }))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">times</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              <strong>Preview:</strong> This task will repeat{' '}
              {localPattern.interval === 1 ? '' : `every ${localPattern.interval} `}
              {localPattern.type}
              {localPattern.type === 'weekly' && localPattern.daysOfWeek && localPattern.daysOfWeek.length > 0 && (
                <> on {weekDays.filter(d => localPattern.daysOfWeek?.includes(d.value)).map(d => d.label).join(', ')}</>
              )}
              {localPattern.type === 'monthly' && localPattern.dayOfMonth && (
                <> on day {localPattern.dayOfMonth}</>
              )}
              {localPattern.endDate && (
                <> until {localPattern.endDate.toLocaleDateString()}</>
              )}
              {localPattern.count && (
                <> for {localPattern.count} occurrences</>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleRemove}
            className="px-3 py-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Remove Recurrence
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
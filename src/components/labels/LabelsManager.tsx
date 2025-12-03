import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Label } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const LabelsManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const { labels, createLabel, updateLabel, deleteLabel } = useAppStore();

  const labelColors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#ec4899', '#f43f5e', '#6b7280', '#4b5563'
  ];

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      await createLabel({
        name: newLabelName.trim(),
        color: selectedColor,
        isPersonal: true,
        ownerId: 'user-1'
      });

      setNewLabelName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleEditLabel = async (labelId: string) => {
    if (!editName.trim()) return;

    try {
      await updateLabel(labelId, {
        name: editName.trim()
      });
      setEditingLabel(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      try {
        await deleteLabel(labelId);
      } catch (error) {
        console.error('Failed to delete label:', error);
      }
    }
  };

  const startEdit = (label: Label) => {
    setEditingLabel(label.id);
    setEditName(label.name);
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setEditName('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Labels</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Label
        </button>
      </div>

      {/* Create Label Form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <form onSubmit={handleCreateLabel}>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="input flex-1"
                autoFocus
              />
              
              <div className="flex gap-1">
                {labelColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newLabelName.trim()}
                className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewLabelName('');
                }}
                className="btn btn-secondary px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Labels List */}
      {labels.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No labels yet
          </h3>
          <p className="text-sm">
            Create labels to organize and categorize your tasks
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: label.color }}
              />
              
              {editingLabel === label.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input flex-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditLabel(label.id)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {label.name}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(label)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
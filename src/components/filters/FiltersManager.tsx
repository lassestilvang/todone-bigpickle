import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Filter } from '../../types';
import { Plus, Edit2, Trash2, Star, Filter as FilterIcon } from 'lucide-react';

export const FiltersManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [editingFilter, setEditingFilter] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuery, setEditQuery] = useState('');
  
  const { filters, createFilter, updateFilter, deleteFilter } = useAppStore();

  const filterColors = [
    '#3b82f6', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#10b981', '#14b8a6', '#06b6d4', '#6366f1', '#8b5cf6',
    '#a855f7', '#ec4899', '#f43f5e', '#6b7280', '#4b5563'
  ];

  const handleCreateFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterName.trim() || !filterQuery.trim()) return;

    try {
      await createFilter({
        name: filterName.trim(),
        query: filterQuery.trim(),
        color: selectedColor,
        isFavorite: false,
        ownerId: 'user-1'
      });

      setFilterName('');
      setFilterQuery('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create filter:', error);
    }
  };

  const handleEditFilter = async (filterId: string) => {
    if (!editName.trim() || !editQuery.trim()) return;

    try {
      await updateFilter(filterId, {
        name: editName.trim(),
        query: editQuery.trim()
      });
      setEditingFilter(null);
      setEditName('');
      setEditQuery('');
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (window.confirm('Are you sure you want to delete this filter?')) {
      try {
        await deleteFilter(filterId);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  const toggleFavorite = async (filter: any) => {
    try {
      await updateFilter(filter.id, {
        isFavorite: !filter.isFavorite
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const startEdit = (filter: any) => {
    setEditingFilter(filter.id);
    setEditName(filter.name);
    setEditQuery(filter.query);
  };

  const cancelEdit = () => {
    setEditingFilter(null);
    setEditName('');
    setEditQuery('');
  };

  const getFilterDescription = (query: string) => {
    // Simple query parser for display
    if (query.includes('p1')) return 'Priority 1 tasks';
    if (query.includes('p2')) return 'Priority 2 tasks';
    if (query.includes('p3')) return 'Priority 3 tasks';
    if (query.includes('today')) return 'Tasks due today';
    if (query.includes('overdue')) return 'Overdue tasks';
    if (query.includes('!completed')) return 'Incomplete tasks';
    if (query.includes('completed')) return 'Completed tasks';
    return query;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </button>
      </div>

      {/* Create Filter Form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <form onSubmit={handleCreateFilter}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Name
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., High Priority Tasks"
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Query
                </label>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="e.g., p1 | p2 | !completed"
                  className="input w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use: p1, p2, p3 for priorities, today, overdue for dates, !completed for status
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterColors.map((color) => (
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
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={!filterName.trim() || !filterQuery.trim()}
                className="btn btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Create Filter
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setFilterName('');
                  setFilterQuery('');
                }}
                className="btn btn-secondary px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters List */}
      {filters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No filters yet
          </h3>
          <p className="text-sm">
            Create filters to quickly find specific tasks
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {editingFilter === filter.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input w-full text-sm"
                    placeholder="Filter name"
                  />
                  <input
                    type="text"
                    value={editQuery}
                    onChange={(e) => setEditQuery(e.target.value)}
                    className="input w-full font-mono text-sm"
                    placeholder="Filter query"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFilter(filter.id)}
                      className="btn btn-primary px-2 py-1 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn-secondary px-2 py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: filter.color }}
                      />
                      <h3 className="font-medium text-gray-900">
                        {filter.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(filter)}
                        className={`p-1 ${
                          filter.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                        } hover:text-yellow-600`}
                      >
                        <Star className={`h-3 w-3 ${filter.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => startEdit(filter)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    {filter.query}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {getFilterDescription(filter.query)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
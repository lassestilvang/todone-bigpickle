import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { FiltersManager } from '../filters/FiltersManager';
import { FilteredTasksView } from '../tasks/FilteredTasksView';
import { Filter as FilterIcon } from 'lucide-react';

export const FiltersView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { filters, setSelectedFilter } = useAppStore();

  const getFilterQuery = (filterQuery: string) => {
    // Simple query parser
    const query: any = {};
    
    if (filterQuery.includes('p1')) query.priority = ['p1'];
    if (filterQuery.includes('p2')) query.priority = ['p2'];
    if (filterQuery.includes('p3')) query.priority = ['p3'];
    if (filterQuery.includes('p4')) query.priority = ['p4'];
    
    if (filterQuery.includes('today')) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.dateRange = { start: startOfDay, end: endOfDay };
    }
    
    if (filterQuery.includes('overdue')) {
      query.dateRange = { end: new Date() };
    }
    
    if (filterQuery.includes('!completed')) {
      query.isCompleted = false;
    }
    
    if (filterQuery.includes('completed')) {
      query.isCompleted = true;
    }
    
    return query;
  };

  const selectedFilterData = filters.find(f => f.id === selectedFilter);

  return (
    <div className="flex-1 flex">
      {/* Filters Sidebar */}
      <div className="w-80 border-r border-gray-200 overflow-auto">
        <FiltersManager />
      </div>

      {/* Filter Results */}
      <div className="flex-1">
        {selectedFilterData ? (
          <FilteredTasksView
            title={selectedFilterData.name}
            query={getFilterQuery(selectedFilterData.query)}
            emptyMessage={`No tasks match "${selectedFilterData.name}" filter`}
            emptyIcon={<FilterIcon className="h-12 w-12" />}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <FilterIcon className="h-12 w-12 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a filter
            </h3>
            <p className="text-sm">
              Choose a filter from the sidebar to see matching tasks
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
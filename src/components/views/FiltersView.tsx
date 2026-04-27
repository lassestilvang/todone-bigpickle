import React from "react";
import { useAppStore } from "../../store/appStore";
import { FiltersManager } from "../filters/FiltersManager";
import { FilteredTasksView } from "../tasks/FilteredTasksView";
import { Filter as FilterIcon } from "lucide-react";
import type { TaskQuery } from "../../types";

interface FiltersViewProps {
  bulkMode?: boolean;
}

export const FiltersView: React.FC<FiltersViewProps> = ({
  bulkMode = false,
}) => {
  console.log("FiltersView bulkMode:", bulkMode); // Use bulkMode to avoid lint error
  const { filters, selectedFilterId } = useAppStore();

  const getFilterQuery = (filterQuery: string): TaskQuery => {
    const query: TaskQuery = {};
    const lowerQuery = filterQuery.toLowerCase();

    // Parse priorities
    const priorities: ("p1" | "p2" | "p3" | "p4")[] = [];
    if (lowerQuery.includes("p1")) priorities.push("p1");
    if (lowerQuery.includes("p2")) priorities.push("p2");
    if (lowerQuery.includes("p3")) priorities.push("p3");
    if (lowerQuery.includes("p4")) priorities.push("p4");
    if (priorities.length > 0) query.priority = priorities;

    // Parse status
    if (lowerQuery.includes("!completed")) {
      query.isCompleted = false;
    } else if (lowerQuery.includes("completed")) {
      query.isCompleted = true;
    }

    // Parse dates
    if (lowerQuery.includes("today")) {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      );
      query.dateRange = { start: startOfDay, end: endOfDay };
    } else if (lowerQuery.includes("overdue")) {
      query.dateRange = { end: new Date() };
    }

    return query;
  };

  const selectedFilterData = filters.find((f) => f.id === selectedFilterId);

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

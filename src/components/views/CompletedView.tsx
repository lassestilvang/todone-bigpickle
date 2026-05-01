import React, { useState, memo, useMemo } from "react";
import { useCompletedTasks } from "../../store/appStore";
import { TaskItem } from "../tasks/TaskItem";
import { BoardView } from "../tasks/BoardView";
import { CalendarView } from "../tasks/CalendarView";
import { DragDropProvider } from "../dnd/DragDropProvider";
import { ViewModeSelector } from "./ViewModeSelector";
import { SortAsc, ChevronDown } from "lucide-react";
import type { Task } from "../../types";

type ViewMode = "list" | "board" | "calendar";

interface CompletedViewProps {
  bulkMode?: boolean;
}

export const CompletedView: React.FC<CompletedViewProps> = memo(
  ({ bulkMode = false }) => {
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<"order" | "dueDate" | "priority">(
      "order",
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const tasks = useCompletedTasks();

    const sortedTasks = useMemo(() => {
      return [...tasks].sort((a: Task, b: Task) => {
        let comparison = 0;

        switch (sortBy) {
          case "dueDate":
            if (!a.dueDate && !b.dueDate) comparison = 0;
            else if (!a.dueDate) comparison = 1;
            else if (!b.dueDate) comparison = -1;
            else
              comparison =
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            break;
          case "priority": {
            const priorityOrder: Record<string, number> = {
              p1: 0,
              p2: 1,
              p3: 2,
              p4: 3,
            };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          }
          case "order":
          default:
            comparison = a.order - b.order;
            break;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });
    }, [tasks, sortBy, sortOrder]);

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Completed Tasks
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {sortedTasks.length}{" "}
                {sortedTasks.length === 1 ? "task" : "tasks"} completed
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ViewModeSelector
                currentMode={viewMode}
                onModeChange={setViewMode}
              />

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="btn btn-ghost px-3 py-2 text-sm flex items-center gap-2"
                >
                  <SortAsc className="h-4 w-4" />
                  Sort
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 dark:bg-zinc-800 dark:border-zinc-700">
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium dark:text-zinc-400">
                      Sort by
                    </div>
                    <button
                      onClick={() => {
                        setSortBy("order");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                        sortBy === "order"
                          ? "bg-gray-100 text-primary-700 dark:bg-zinc-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      Order
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("dueDate");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                        sortBy === "dueDate"
                          ? "bg-gray-100 text-primary-700 dark:bg-zinc-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      Due Date
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("priority");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                        sortBy === "priority"
                          ? "bg-gray-100 text-primary-700 dark:bg-zinc-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      Priority
                    </button>

                    <div className="border-t border-gray-100 my-1 dark:border-zinc-600"></div>
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium dark:text-zinc-400">
                      Order
                    </div>
                    <button
                      onClick={() => {
                        setSortOrder("asc");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                        sortOrder === "asc"
                          ? "bg-gray-100 text-primary-700 dark:bg-zinc-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("desc");
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${
                        sortOrder === "desc"
                          ? "bg-gray-100 text-primary-700 dark:bg-zinc-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-zinc-300"
                      }`}
                    >
                      Descending
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-auto">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed tasks
              </h3>
              <p className="text-sm text-gray-500">
                Complete some tasks to see them here
              </p>
            </div>
          ) : (
            <>
              {viewMode === "list" && (
                <DragDropProvider>
                  <div className="p-4 space-y-1">
                    {sortedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} bulkMode={bulkMode} />
                    ))}
                  </div>
                </DragDropProvider>
              )}

              {viewMode === "board" && (
                <BoardView
                  tasks={sortedTasks}
                  title="Completed"
                  groupBy="priority"
                />
              )}

              {viewMode === "calendar" && (
                <CalendarView tasks={sortedTasks} title="Completed" />
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

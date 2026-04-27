import React, { useState, useMemo } from "react";
import { useUpcomingTasks } from "../../store/appStore";
import { TaskItem } from "../tasks/TaskItem";
import { BoardView } from "../tasks/BoardView";
import { CalendarView } from "../tasks/CalendarView";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  ChevronDown,
} from "lucide-react";
import { ViewModeSelector } from "./ViewModeSelector";
import type { Task } from "../../types";

type ViewMode = "list" | "board" | "calendar";

interface UpcomingViewProps {
  bulkMode?: boolean;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  bulkMode = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<"order" | "dueDate" | "priority">(
    "order",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const upcomingTasks = useUpcomingTasks();

  const sortedTasks = useMemo(() => {
    return [...upcomingTasks].sort((a: Task, b: Task) => {
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
          const priorityOrder = { p1: 0, p2: 1, p3: 2, p4: 3 };
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
  }, [upcomingTasks, sortBy, sortOrder]);

  // Group tasks by date
  const tasksByDate = sortedTasks.reduce(
    (acc: Record<string, Task[]>, task: Task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
      }
      return acc;
    },
    {} as Record<string, typeof upcomingTasks>,
  );

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming</h2>
            <p className="text-sm text-gray-500 mt-1">
              Next 7 days • {upcomingTasks.length}{" "}
              {upcomingTasks.length === 1 ? "task" : "tasks"}
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
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <div className="text-sm text-gray-600 min-w-[120px] text-center">
              {currentDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(
                currentDate.getTime() + 6 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto">
        {upcomingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming tasks
            </h3>
            <p className="text-sm text-gray-500">
              Take a break and plan for the future
            </p>
          </div>
        ) : (
          <>
            {viewMode === "list" && (
              <div className="p-4">
                {sortedDates.map((dateKey) => {
                  const date = new Date(dateKey);
                  const tasks = tasksByDate[dateKey];

                  return (
                    <div key={dateKey} className="mb-6">
                      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2 border-b border-gray-100">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <h3 className="font-medium text-gray-700">
                          {formatDate(date)}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {tasks.length}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            bulkMode={bulkMode}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "board" && (
              <BoardView
                tasks={upcomingTasks}
                title="Upcoming"
                groupBy="priority"
              />
            )}

            {viewMode === "calendar" && (
              <CalendarView tasks={upcomingTasks} title="Upcoming" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

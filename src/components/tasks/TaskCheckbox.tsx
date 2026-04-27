import React, { memo, useCallback } from "react";
import { useAppStore } from "../../store/appStore";
import { Check, Circle, Square, CheckSquare } from "lucide-react";
import type { Task } from "../../types";

interface TaskCheckboxProps {
  task: Task;
  onToggleComplete?: () => void;
  bulkMode?: boolean;
}

export const TaskCheckbox: React.FC<TaskCheckboxProps> = memo(
  ({ task, onToggleComplete, bulkMode = false }) => {
    const toggleTaskComplete = useAppStore((state) => state.toggleTaskComplete);
    const toggleTaskSelection = useAppStore(
      (state) => state.toggleTaskSelection,
    );
    const isSelected = useAppStore((state) =>
      state.selectedTaskIds.includes(task.id),
    );

    const handleToggle = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (bulkMode) {
          toggleTaskSelection(task.id);
        } else {
          if (onToggleComplete) {
            onToggleComplete();
          } else {
            await toggleTaskComplete(task.id);
          }
        }
      },
      [
        task.id,
        onToggleComplete,
        toggleTaskComplete,
        toggleTaskSelection,
        bulkMode,
      ],
    );

    if (bulkMode) {
      return (
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${
            isSelected
              ? "text-primary-600"
              : "text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          }`}
          aria-label={isSelected ? "Deselect task" : "Select task"}
          aria-pressed={isSelected}
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      );
    }

    return (
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.isCompleted
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-green-500 dark:border-gray-600 dark:hover:border-green-400"
        }`}
        aria-label={
          task.isCompleted ? "Mark task as incomplete" : "Mark task as complete"
        }
        aria-pressed={task.isCompleted}
      >
        {task.isCompleted && <Check className="w-3 h-3" />}
        {!task.isCompleted && (
          <Circle className="w-3 h-3 opacity-0 hover:opacity-50" />
        )}
      </button>
    );
  },
);

TaskCheckbox.displayName = "TaskCheckbox";

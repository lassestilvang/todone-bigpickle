import React, { memo, useMemo } from "react";
import { Clock, Calendar, Timer, Flag } from "lucide-react";
import type { Task } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface TaskMetaProps {
  task: Task;
  isBlockedBy?: boolean;
}

export const TaskMeta: React.FC<TaskMetaProps> = memo(({ task }) => {
  const renderPriority = useMemo(() => {
    if (!task.priority || task.priority === "p4") return null;

    const colors = {
      p1: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      p2: "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
      p3: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      p4: "text-gray-500 dark:text-zinc-400",
    };

    return (
      <div
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[task.priority]}`}
      >
        <Flag className="w-2.5 h-2.5 fill-current" />
        <span>{task.priority}</span>
      </div>
    );
  }, [task.priority]);

  const renderDueDate = useMemo(() => {
    if (!task.dueDate) return null;

    const now = new Date();
    const isOverdue = task.dueDate < now && !task.isCompleted;
    const isToday = task.dueDate.toDateString() === now.toDateString();

    return (
      <div
        className={`flex items-center gap-1 text-xs ${
          isOverdue
            ? "text-red-500 dark:text-red-400"
            : isToday
              ? "text-orange-500 dark:text-orange-400"
              : "text-gray-500 dark:text-zinc-400"
        }`}
      >
        <Calendar className="w-3 h-3" />
        <span>{formatDistanceToNow(task.dueDate, { addSuffix: true })}</span>
        {task.dueTime && <span className="ml-1">at {task.dueTime}</span>}
      </div>
    );
  }, [task.dueDate, task.dueTime, task.isCompleted]);

  const renderTimeTracking = useMemo(() => {
    if (!task.timeTracking) return null;

    const { totalTime, isTracking } = task.timeTracking;
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;

    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          <span>
            {hours > 0 && `${hours}h `}
            {minutes}m
          </span>
        </div>
        {isTracking && (
          <div className="flex items-center gap-1 text-green-500">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Tracking</span>
          </div>
        )}
      </div>
    );
  }, [task.timeTracking]);

  return (
    <div className="flex items-center gap-3 mt-1">
      {renderPriority}
      {renderDueDate}
      {renderTimeTracking}
    </div>
  );
});

TaskMeta.displayName = "TaskMeta";

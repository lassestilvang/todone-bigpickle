import React, { type ReactNode, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAppStore } from '../../store/appStore';
import { TaskItem } from '../tasks/TaskItem';
import type { Task } from '../../types';

interface DragDropContextProps {
  children: ReactNode;
  tasks: Task[];
  onReorder?: (tasks: Task[]) => void;
}

export const DragDropProvider: React.FC<DragDropContextProps> = ({
  children,
  tasks,
  onReorder
}) => {
  const { reorderTasks, updateTask } = useAppStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      setActiveTask(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask || !overTask) {
      setActiveTask(null);
      return;
    }

    // Get all tasks that need to be reordered
    const activeIndex = tasks.findIndex(t => t.id === activeId);
    const overIndex = tasks.findIndex(t => t.id === overId);

    let reorderedTasks = [...tasks];
    
    // If dropping on a parent task, make it a subtask
    if (overTask && !overTask.parentTaskId) {
      const updatedTask = { ...activeTask, parentTaskId: overTask.id };
      await updateTask(activeId, { parentTaskId: overTask.id });
      
      // Remove from original position and add to new position
      reorderedTasks = reorderedTasks.filter(t => t.id !== activeId);
      const insertIndex = reorderedTasks.findIndex(t => t.id === overId) + 1;
      reorderedTasks.splice(insertIndex, 0, updatedTask);
    } else {
      // Simple reorder
      reorderedTasks = arrayMove(tasks, activeIndex, overIndex);
    }

    // Update order values
    const reorderedTasksWithOrder = reorderedTasks.map((task, index) => ({
      ...task,
      order: index
    }));
    
    await reorderTasks(reorderedTasksWithOrder);
    
    if (onReorder) {
      onReorder(reorderedTasks);
    }

    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (overTask && activeTask && isDescendant(overTask.id, activeTask.id)) {
      return;
    }
  };

  // Helper function to check if a task is a descendant of another
  const isDescendant = (taskId: string, ancestorId: string): boolean => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.parentTaskId) return false;
    if (task.parentTaskId === ancestorId) return true;
    return isDescendant(task.parentTaskId, ancestorId);
  };

  return (
    <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {children}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white p-3 rounded-md border-2 border-primary-500 shadow-lg opacity-90">
              <TaskItem task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
  );
};
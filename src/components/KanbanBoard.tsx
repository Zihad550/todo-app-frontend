import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Task, TaskStatus } from '@/types/task';
import { useState } from 'react';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  availableTags?: string[];
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-100 dark:bg-gray-800' },
  {
    id: 'scheduled',
    title: 'Scheduled',
    color: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'bg-green-100 dark:bg-green-900/20',
  },
];

export function KanbanBoard({
  tasks,
  onMoveTask,
  onReorderTasks,
  onUpdateTask,
  onDeleteTask,
  availableTags = [],
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column or a task
    const validStatuses: TaskStatus[] = [
      'backlog',
      'scheduled',
      'progress',
      'completed',
    ];

    let targetStatus: TaskStatus;
    let targetTask: Task | undefined;

    if (validStatuses.includes(overId as TaskStatus)) {
      // Dropped on a column
      targetStatus = overId as TaskStatus;
    } else {
      // Dropped on a task
      targetTask = tasks.find((t) => t.id === overId);
      if (!targetTask) return;
      targetStatus = targetTask.status;
    }

    // If moving to a different column
    if (activeTask.status !== targetStatus) {
      console.log(
        `Moving task "${activeTask.title}" from ${activeTask.status} to ${targetStatus}`
      );
      onMoveTask(activeId, targetStatus);
      return;
    }

    // If reordering within the same column
    if (targetTask && activeId !== overId) {
      const columnTasks = tasks.filter((t) => t.status === targetStatus);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        const reorderedColumnTasks = arrayMove(
          columnTasks,
          activeIndex,
          overIndex
        );

        // Create new tasks array with reordered tasks in this column
        const otherTasks = tasks.filter((t) => t.status !== targetStatus);
        const newTasks = [...otherTasks, ...reorderedColumnTasks];

        console.log(
          `Reordering task "${activeTask.title}" within ${targetStatus} column`
        );
        onReorderTasks(newTasks);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasksByStatus[column.id] || []}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            availableTags={availableTags}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            onUpdate={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

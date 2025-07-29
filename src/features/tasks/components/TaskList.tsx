import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Task, UpdateTaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder?: (tasks: Task[]) => void;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
}

export const TaskList = ({
  tasks,
  onUpdate,
  onDelete,
  onToggle,
  onReorder,
  availableTags = [],
  onCreateTag,
}: TaskListProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Sync local tasks with props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      console.log('No drop target');
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      const activeIndex = localTasks.findIndex((task) => task.id === activeId);
      const overIndex = localTasks.findIndex((task) => task.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedTasks = arrayMove(localTasks, activeIndex, overIndex);
        console.log(
          'New order:',
          reorderedTasks.map((t) => t.title)
        );

        // Update local state immediately for instant visual feedback
        setLocalTasks(reorderedTasks);

        // Call parent reorder function
        if (onReorder) {
          onReorder(reorderedTasks);
        }
      }
    }
  };

  if (localTasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks yet</p>
        <p className="text-sm">Create your first task to get started!</p>
      </div>
    );
  }

  // If no reorder function is provided, render without drag and drop
  if (!onReorder) {
    return (
      <div className="space-y-4">
        {localTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggle={onToggle}
            availableTags={availableTags}
            onCreateTag={onCreateTag}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localTasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {localTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggle={onToggle}
              availableTags={availableTags}
              onCreateTag={onCreateTag}
              isDraggable={true}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <TaskItem
            task={activeTask}
            onUpdate={() => {}}
            onDelete={() => {}}
            onToggle={() => {}}
            availableTags={availableTags}
            onCreateTag={onCreateTag}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

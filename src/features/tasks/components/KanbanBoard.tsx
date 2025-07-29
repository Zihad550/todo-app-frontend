import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';

import type { TagWithMetadata } from '@/features/tags';
import { useUpdateTaskMutation } from '@/redux/features/taskApi';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string, tag?: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  {
    id: TaskStatus.BACKLOG,
    title: 'Backlog',
    color: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: TaskStatus.SCHEDULED,
    title: 'Scheduled',
    color: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    id: TaskStatus.PROGRESS,
    title: 'In Progress',
    color: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    id: TaskStatus.COMPLETED,
    title: 'Completed',
    color: 'bg-green-100 dark:bg-green-900/20',
  },
];

interface MobileKanbanViewProps {
  columns: { id: TaskStatus; title: string; color: string }[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddSubtask: (taskId: string, title: string, tag?: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  availableTags: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  collapsedColumns: Set<TaskStatus>;
  onToggleCollapse: (columnId: TaskStatus) => void;
}

function MobileKanbanView({
  columns,
  tasksByStatus,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onAddSubtask,
  onToggleSubtask,
  availableTags,
  onCreateTag,
  collapsedColumns,
  onToggleCollapse,
}: MobileKanbanViewProps) {
  return (
    <Tabs defaultValue={TaskStatus.BACKLOG} className="h-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        {columns.map((column) => (
          <TabsTrigger
            key={column.id}
            value={column.id}
            className="text-xs px-2 py-1"
          >
            <div className="flex flex-col items-center">
              <span className="truncate">{column.title}</span>
              <span className="text-xs text-muted-foreground">
                {tasksByStatus[column.id]?.length || 0}
              </span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {columns.map((column) => (
        <TabsContent key={column.id} value={column.id} className="h-full mt-0">
          <KanbanColumn
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasksByStatus[column.id] || []}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onMoveTask={onMoveTask}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            availableTags={availableTags}
            onCreateTag={onCreateTag}
            isCollapsed={collapsedColumns.has(column.id)}
            onToggleCollapse={() => onToggleCollapse(column.id)}
            isMobile={true}
            disableDragAndDrop={true}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function KanbanBoard({
  tasks,
  onMoveTask,
  onReorderTasks,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  availableTags = [],
  onCreateTag,
}: KanbanBoardProps) {
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<TaskStatus>>(
    new Set()
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column or a task
    const validStatuses: TaskStatus[] = [
      TaskStatus.BACKLOG,
      TaskStatus.SCHEDULED,
      TaskStatus.PROGRESS,
      TaskStatus.COMPLETED,
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
      onMoveTask(activeId, targetStatus);
      return;
    }

    // If reordering within the same column
    if (targetTask && activeId !== overId) {
      const columnTasks = tasks.filter((t) => t.status === targetStatus);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        let reorderedColumnTasks = arrayMove(
          columnTasks,
          activeIndex,
          overIndex
        );

        reorderedColumnTasks = reorderedColumnTasks.map((item, index) => ({
          ...item,
          position: index,
        }));

        for (const task of reorderedColumnTasks) {
          await updateTaskMutation({ id: task.id, data: task });
        }

        // Create new tasks array with reordered tasks in this column
        const otherTasks = tasks.filter((t) => t.status !== targetStatus);
        const newTasks = [...otherTasks, ...reorderedColumnTasks];

        onReorderTasks(newTasks);
      }
    }
  };

  const toggleColumnCollapse = (columnId: TaskStatus) => {
    setCollapsedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: Single column view with tabs */}
      <div className="block md:hidden">
        <MobileKanbanView
          columns={columns}
          tasksByStatus={tasksByStatus}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          availableTags={availableTags}
          onCreateTag={onCreateTag}
          collapsedColumns={collapsedColumns}
          onToggleCollapse={toggleColumnCollapse}
        />
      </div>

      {/* Desktop: Multi-column view */}
      <div className="hidden md:block h-full">
        <div className="flex gap-3 lg:gap-4 xl:gap-6 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasksByStatus[column.id] || []}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              availableTags={availableTags}
              onCreateTag={onCreateTag}
              isCollapsed={collapsedColumns.has(column.id)}
              onToggleCollapse={() => toggleColumnCollapse(column.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            onUpdate={() => {}}
            onDelete={() => {}}
            onAddSubtask={async () => {}}
            onToggleSubtask={async () => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

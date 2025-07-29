import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import type { Task, TaskStatus } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
  onAddSubtask: (taskId: string, title: string, tag?: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  disableDragAndDrop?: boolean;
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onAddSubtask,
  onToggleSubtask,
  availableTags = [],
  onCreateTag,
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  disableDragAndDrop = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Mobile layout - full width single column
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className={`rounded-lg mb-4 ${color} p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div
            ref={disableDragAndDrop ? undefined : setNodeRef}
            className={`flex-1 min-h-[300px] p-2 rounded-lg border-2 border-dashed transition-colors ${
              !disableDragAndDrop && isOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/20'
            }`}
          >
            {disableDragAndDrop ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onMoveTask={onMoveTask}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                    availableTags={availableTags}
                    onCreateTag={onCreateTag}
                    isMobile={true}
                    disableDragAndDrop={true}
                  />
                ))}
              </div>
            ) : (
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onAddSubtask={onAddSubtask}
                      onToggleSubtask={onToggleSubtask}
                      availableTags={availableTags}
                      onCreateTag={onCreateTag}
                      isMobile={true}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - responsive grid columns
  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16 min-w-16' : 'min-w-0 flex-1'
      }`}
    >
      <div
        className={`rounded-lg mb-3 lg:mb-4 ${color} ${
          isCollapsed ? 'p-2' : 'p-3 lg:p-4'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={isCollapsed ? 'hidden' : ''}>
            <h3 className="font-semibold text-base lg:text-lg mb-1 truncate">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          {isCollapsed && (
            <div className="flex flex-col items-center w-full">
              <h3 className="font-semibold text-sm writing-mode-vertical transform rotate-180 mb-2 whitespace-nowrap">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">{tasks.length}</p>
            </div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={`h-6 w-6 p-0 hover:bg-background/20 flex-shrink-0 ${
                isCollapsed ? 'ml-0' : 'ml-2'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-[200px] lg:min-h-[250px] p-2 rounded-lg border-2 border-dashed transition-colors ${
            isOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20'
          }`}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  availableTags={availableTags}
                  onCreateTag={onCreateTag}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {isCollapsed && (
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-[200px] lg:min-h-[250px] w-12 mx-auto rounded-lg border-2 border-dashed transition-colors ${
            isOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20'
          }`}
          title={`${tasks.length} tasks in ${title}`}
        />
      )}
    </div>
  );
}

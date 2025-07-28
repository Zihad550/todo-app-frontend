import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, UpdateTaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/hooks/useTags';
import { SubtaskList } from '@/components/SubtaskList';
import { EditTaskModal } from '@/components/EditTaskModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  isDraggable?: boolean;
  isDragging?: boolean;
}

export const TaskItem = ({
  task,
  onUpdate,
  onDelete,
  onToggle,
  availableTags = [],
  onCreateTag,
  isDraggable = false,
  isDragging = false,
}: TaskItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(date);
  };

  return (
    <>
      <EditTaskModal
        task={task}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUpdate}
        availableTags={availableTags}
        onCreateTag={onCreateTag}
      />
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'p-4 border rounded-lg bg-card transition-all hover:shadow-md',
          task.completed && 'opacity-60',
          (isSortableDragging || isDragging) && 'opacity-50 shadow-lg rotate-2'
        )}
      >
        <div className="flex items-start gap-3">
          {isDraggable && (
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-6 h-6 mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3
                className={cn(
                  'font-medium text-lg',
                  task.completed && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>

              <div className="flex gap-1">
                <Button
                  onClick={handleEditClick}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onDelete(task.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {task.description && (
              <p
                className={cn(
                  'text-muted-foreground',
                  task.completed && 'line-through'
                )}
              >
                {task.description}
              </p>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <SubtaskList
                subtasks={task.subtasks}
                taskId={task.id}
                availableTags={availableTags}
                onCreateTag={onCreateTag}
                className="mt-3"
              />
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tagId) => {
                  const tag = availableTags?.find((t) => t.id === tagId);
                  return tag ? (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Created:</span>
                  <span title={formatDate(new Date(task.createdAt))}>
                    {formatRelativeTime(new Date(task.createdAt))}
                  </span>
                </span>
                <span className="text-xs opacity-75">
                  {formatDate(new Date(task.createdAt)).split(',')[1]?.trim()}
                </span>
              </div>
              {new Date(task.updatedAt).getTime() !==
                new Date(task.createdAt).getTime() && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Updated:</span>
                    <span title={formatDate(new Date(task.updatedAt))}>
                      {formatRelativeTime(new Date(task.updatedAt))}
                    </span>
                  </span>
                  <span className="text-xs opacity-75">
                    {formatDate(new Date(task.updatedAt)).split(',')[1]?.trim()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

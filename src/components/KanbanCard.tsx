import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Task } from '@/types/task';
import { useState } from 'react';
import { TaskForm } from './TaskForm';

interface KanbanCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  availableTags?: string[];
}

export function KanbanCard({
  task,
  onUpdate,
  onDelete,
  isDragging = false,
  availableTags = [],
}: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

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
    return date.toLocaleDateString();
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowActions(false);
  };

  const handleUpdate = (updates: Partial<Task>) => {
    onUpdate(task.id, updates);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-background border rounded-lg p-4">
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description,
            tags: task.tags,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Task"
          availableTags={availableTags}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background border rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-xs leading-tight pr-1">{task.title}</h4>
        {showActions && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Edit className="h-2.5 w-2.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mb-1.5">
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-1.5 py-0 h-4"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-1">
        <div className="flex justify-between items-center">
          <span className="text-xs">Created:</span>
          <span
            className="text-xs"
            title={new Date(task.createdAt).toLocaleString()}
          >
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>
        {task.updatedAt.getTime() !== task.createdAt.getTime() && (
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs">Updated:</span>
            <span
              className="text-xs"
              title={new Date(task.updatedAt).toLocaleString()}
            >
              {formatRelativeTime(task.updatedAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

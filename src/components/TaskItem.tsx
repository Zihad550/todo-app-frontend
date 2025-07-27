import { useState } from 'react';
import type { Task, UpdateTaskInput } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TagSelector } from '@/components/TagSelector';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  availableTags?: string[];
}

export const TaskItem = ({
  task,
  onUpdate,
  onDelete,
  onToggle,
  availableTags = [],
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editTags, setEditTags] = useState<string[]>(task.tags);

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags: editTags,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditTags(task.tags);
    setIsEditing(false);
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

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title..."
          />
        </div>

        <div>
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description..."
            rows={3}
          />
        </div>

        <div>
          <TagSelector
            selectedTags={editTags}
            availableTags={availableTags}
            onTagsChange={setEditTags}
            placeholder="Select or create tags..."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 border rounded-lg bg-card transition-all hover:shadow-md',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
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
                onClick={() => setIsEditing(true)}
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

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t pt-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <span className="font-medium">Created:</span>
                <span title={formatDate(task.createdAt)}>
                  {formatRelativeTime(task.createdAt)}
                </span>
              </span>
              <span className="text-xs opacity-75">
                {formatDate(task.createdAt).split(',')[1]?.trim()}
              </span>
            </div>
            {task.updatedAt.getTime() !== task.createdAt.getTime() && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Updated:</span>
                  <span title={formatDate(task.updatedAt)}>
                    {formatRelativeTime(task.updatedAt)}
                  </span>
                </span>
                <span className="text-xs opacity-75">
                  {formatDate(task.updatedAt).split(',')[1]?.trim()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

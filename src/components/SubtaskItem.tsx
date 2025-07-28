import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useSubtasks } from '@/hooks/useSubtasks';
import type { Subtask } from '@/types/task';
import type { TagWithMetadata } from '@/hooks/useTags';
import { TagSelector } from '@/components/TagSelector';
import { cn, getSubtaskId } from '@/lib/utils';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

interface SubtaskItemProps {
  subtask: Subtask;
  taskId: string;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  className?: string;
}

export function SubtaskItem({
  subtask,
  taskId,
  availableTags = [],
  onCreateTag,
  className,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [editTag, setEditTag] = useState<string[]>(
    subtask.tag ? [subtask.tag] : []
  );

  const { toggleSubtask, updateSubtask, deleteSubtask } = useSubtasks(taskId);

  const handleSave = async () => {
    if (editTitle.trim()) {
      const subtaskId = getSubtaskId(subtask);
      await updateSubtask(subtaskId, {
        title: editTitle.trim(),
        tag: editTag[0] || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(subtask.title);
    setEditTag(subtask.tag ? [subtask.tag] : []);
    setIsEditing(false);
  };

  const handleToggle = () => {
    const subtaskId = getSubtaskId(subtask);
    toggleSubtask(subtaskId);
  };

  const handleDelete = () => {
    const subtaskId = getSubtaskId(subtask);
    deleteSubtask(subtaskId);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md border bg-card',
        subtask.completed && 'opacity-60',
        className
      )}
    >
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={handleToggle}
        className="shrink-0"
      />

      {isEditing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 h-8"
            placeholder="Subtask title"
          />
          <div className="w-32">
            <TagSelector
              selectedTags={editTag}
              availableTags={availableTags}
              onTagsChange={(tags) => setEditTag(tags.slice(0, 1))}
              onCreateTag={onCreateTag}
              placeholder="Select tag..."
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span
            className={cn(
              'flex-1 text-sm',
              subtask.completed && 'line-through'
            )}
          >
            {subtask.title}
          </span>
          {subtask.tag &&
            (() => {
              const tag = availableTags.find((t) => t.id === subtask.tag);
              return tag ? (
                <span className="px-2 py-1 text-xs bg-secondary rounded-md">
                  {tag.name}
                </span>
              ) : null;
            })()}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}

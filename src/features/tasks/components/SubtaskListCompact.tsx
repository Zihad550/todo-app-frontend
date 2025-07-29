import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { Subtask } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { cn, getSubtaskId } from '@/lib/utils';
import { Plus, Check, X } from 'lucide-react';
import { useState } from 'react';

interface SubtaskListCompactProps {
  subtasks: Subtask[];
  taskId: string;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  onAddSubtask: (taskId: string, title: string, tag?: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  className?: string;
  isMobile?: boolean;
}

export function SubtaskListCompact({
  subtasks,
  taskId,
  availableTags = [],
  onCreateTag: _onCreateTag,
  onAddSubtask,
  onToggleSubtask,
  className,
  isMobile = false,
}: SubtaskListCompactProps) {
  // onCreateTag is available for future enhancement but not currently used in compact view
  const [showAddButton, setShowAddButton] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleToggle = (subtask: Subtask) => {
    const subtaskId = getSubtaskId(subtask);
    onToggleSubtask(taskId, subtaskId);
  };

  const handleAdd = async () => {
    if (newTitle.trim()) {
      await onAddSubtask(taskId, newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div
      className={cn('space-y-1', className)}
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      {/* Subtask items */}
      {subtasks.map((subtask) => (
        <div
          key={getSubtaskId(subtask)}
          className={cn(
            'flex items-center gap-2 p-1 rounded-sm',
            subtask.completed && 'opacity-60'
          )}
        >
          <Checkbox
            checked={subtask.completed}
            onCheckedChange={() => handleToggle(subtask)}
            className="shrink-0 h-3 w-3"
          />
          <span
            className={cn(
              'flex-1 truncate',
              isMobile ? 'text-xs' : 'text-xs',
              subtask.completed && 'line-through'
            )}
            title={subtask.title}
          >
            {subtask.title}
          </span>
          {subtask.tag &&
            (() => {
              const tag = availableTags.find((t) => t.id === subtask.tag);
              return tag ? (
                <span
                  key={`tag-${getSubtaskId(subtask)}`}
                  className="px-1 py-0.5 text-xs bg-secondary rounded text-muted-foreground shrink-0"
                >
                  {tag.name}
                </span>
              ) : null;
            })()}
        </div>
      ))}

      {/* Add subtask section */}
      {isAdding && (
        <div key="add-form" className="flex items-center gap-1 p-1">
          <div className="w-3 h-3 shrink-0" />{' '}
          {/* Spacer for checkbox alignment */}
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title"
            className="flex-1 h-6 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <Button size="sm" onClick={handleAdd} className="h-6 w-6 p-0">
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {!isAdding && showAddButton && (
        <Button
          key="add-button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsAdding(true);
          }}
          className={cn(
            'w-full justify-start h-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity',
            isMobile ? 'text-xs' : 'text-xs'
          )}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add subtask
        </Button>
      )}
    </div>
  );
}

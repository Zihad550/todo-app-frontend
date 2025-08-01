import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubtaskItem } from './SubtaskItem';
import { useSubtasks } from '../hooks/useSubtasks';
import type { Subtask } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { TagSelector } from '@/features/tags';
import { cn, getSubtaskId } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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

interface SubtaskListProps {
  subtasks: Subtask[];
  taskId: string;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  className?: string;
}

export function SubtaskList({
  subtasks,
  taskId,
  availableTags = [],
  onCreateTag,
  className,
}: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState<string[]>([]);
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null);

  const { createSubtask, reorderSubtasks } = useSubtasks(taskId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAdd = async () => {
    if (newTitle.trim()) {
      await createSubtask({
        title: newTitle.trim(),
        tag: newTag[0] || undefined,
      });
      setNewTitle('');
      setNewTag([]);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewTag([]);
    setIsAdding(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const subtask = subtasks.find((s) => getSubtaskId(s) === event.active.id);
    setActiveSubtask(subtask || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSubtask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      const activeIndex = subtasks.findIndex(
        (s) => getSubtaskId(s) === activeId
      );
      const overIndex = subtasks.findIndex((s) => getSubtaskId(s) === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedSubtasks = arrayMove(subtasks, activeIndex, overIndex);
        reorderSubtasks(reorderedSubtasks);
      }
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className={cn('space-y-2', className)}>
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Subtasks</span>
          <span>
            {completedCount}/{totalCount} completed
          </span>
        </div>
      )}

      {subtasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subtasks.map((s) => getSubtaskId(s))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 group">
              {subtasks.map((subtask) => (
                <SubtaskItem
                  key={getSubtaskId(subtask)}
                  subtask={subtask}
                  taskId={taskId}
                  availableTags={availableTags}
                  onCreateTag={onCreateTag}
                  isDraggable={true}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeSubtask ? (
              <SubtaskItem
                subtask={activeSubtask}
                taskId={taskId}
                availableTags={availableTags}
                onCreateTag={onCreateTag}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-1 group" />
      )}

      {isAdding ? (
        <div className="flex items-center gap-2 p-2 rounded-md border bg-card">
          <div className="w-4 h-4 shrink-0" />{' '}
          {/* Spacer for checkbox alignment */}
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask title"
            className="flex-1 h-8"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="w-32">
            <TagSelector
              selectedTags={newTag}
              availableTags={availableTags}
              onTagsChange={(tags) => setNewTag(tags.slice(0, 1))}
              onCreateTag={onCreateTag}
              placeholder="Select tag..."
            />
          </div>
          <Button size="sm" onClick={handleAdd} className="h-8 px-3">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 px-3"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full justify-start h-8 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add subtask
        </Button>
      )}
    </div>
  );
}

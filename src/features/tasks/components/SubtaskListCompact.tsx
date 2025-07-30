import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { Subtask } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { cn, getSubtaskId } from '@/lib/utils';
import { Plus, Check, X, GripVertical } from 'lucide-react';
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useSubtasks } from '../hooks/useSubtasks';

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
  onCreateTag,
  onAddSubtask,
  onToggleSubtask,
  className,
  isMobile = false,
}: SubtaskListCompactProps) {
  // onCreateTag is available for future enhancement but not currently used in compact view
  void onCreateTag; // Suppress unused variable warning
  const [showAddButton, setShowAddButton] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null);

  const { reorderSubtasks } = useSubtasks(taskId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // Draggable subtask item component
  function DraggableSubtaskItem({
    subtask,
    isDragging = false,
  }: {
    subtask: Subtask;
    isDragging?: boolean;
  }) {
    const subtaskId = getSubtaskId(subtask);
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({
      id: subtaskId,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'flex items-center gap-2 p-1 rounded-sm group',
          subtask.completed && 'opacity-60',
          (isDragging || isSortableDragging) && 'opacity-50 shadow-lg'
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-2 w-2" />
        </div>
        <Checkbox
          checked={subtask.completed}
          onCheckedChange={() => handleToggle(subtask)}
          className="shrink-0 h-3 w-3"
        />
        <span
          className={cn(
            'flex-1 cursor-pointer hover:text-foreground transition-colors',
            isMobile ? 'text-xs' : 'text-xs',
            subtask.completed && 'line-through'
          )}
          title={subtask.title}
          onClick={() => handleToggle(subtask)}
        >
          {subtask.title}
        </span>
        {subtask.tag &&
          (() => {
            const tag = availableTags.find((t) => t.id === subtask.tag);
            return tag ? (
              <span className="px-1 py-0.5 text-xs bg-secondary rounded text-muted-foreground shrink-0">
                {tag.name}
              </span>
            ) : null;
          })()}
      </div>
    );
  }

  return (
    <div
      className={cn('space-y-1', className)}
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      {/* Subtask items with drag and drop */}
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
            {subtasks.map((subtask) => (
              <DraggableSubtaskItem
                key={getSubtaskId(subtask)}
                subtask={subtask}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeSubtask ? (
              <DraggableSubtaskItem subtask={activeSubtask} isDragging={true} />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : null}

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

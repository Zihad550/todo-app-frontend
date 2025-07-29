import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Task } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { TaskStatus } from '@/types/task';
import { useState } from 'react';
import { EditTaskModal } from './EditTaskModal';
import { SubtaskListCompact } from './SubtaskListCompact';
import { getSubtaskId } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
  onAddSubtask: (taskId: string, title: string, tag?: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  isDragging?: boolean;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  isMobile?: boolean;
  disableDragAndDrop?: boolean;
}

export function KanbanCard({
  task,
  onUpdate,
  onDelete,
  onMoveTask,
  onAddSubtask,
  onToggleSubtask,
  isDragging = false,
  availableTags = [],
  onCreateTag,
  isMobile = false,
  disableDragAndDrop = false,
}: KanbanCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isSubtasksCollapsed, setIsSubtasksCollapsed] = useState(false);

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
    disabled: disableDragAndDrop,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setShowActions(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowActions(false);
  };

  const handleMoveTask = (newStatus: TaskStatus) => {
    if (onMoveTask && newStatus !== task.status) {
      onMoveTask(task.id, newStatus);
    }
  };

  const statusOptions = [
    { value: TaskStatus.BACKLOG, label: 'Backlog' },
    { value: TaskStatus.SCHEDULED, label: 'Scheduled' },
    { value: TaskStatus.PROGRESS, label: 'In Progress' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
  ];

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
        ref={disableDragAndDrop ? undefined : setNodeRef}
        style={disableDragAndDrop ? undefined : style}
        {...(disableDragAndDrop ? {} : attributes)}
        {...(disableDragAndDrop ? {} : listeners)}
        className={`bg-background border rounded-md shadow-sm hover:shadow-md transition-shadow group touch-manipulation ${
          disableDragAndDrop ? '' : 'cursor-grab active:cursor-grabbing'
        } ${isMobile ? 'p-4' : 'p-3'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onTouchStart={() => setShowActions(true)}
      >
        <div
          className={`flex items-start justify-between ${
            isMobile ? 'mb-3' : 'mb-2'
          }`}
        >
          <h4
            className={`font-medium leading-tight pr-2 flex-1 ${
              isMobile ? 'text-base' : 'text-sm'
            }`}
          >
            {task.title}
          </h4>
          {showActions && (
            <div
              className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                isMobile ? 'opacity-100' : ''
              }`}
            >
              <Button
                size="sm"
                variant="ghost"
                className={`p-0 ${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`p-0 text-destructive hover:text-destructive ${
                  isMobile ? 'h-8 w-8' : 'h-6 w-6'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile move task section */}
        {isMobile && disableDragAndDrop && onMoveTask && (
          <div className="mb-3">
            <Select value={task.status} onValueChange={handleMoveTask}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {task.description && (
          <p
            className={`text-muted-foreground ${
              isMobile ? 'text-sm mb-3' : 'text-xs mb-2'
            }`}
          >
            {task.description}
          </p>
        )}

        {task.tags.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isMobile ? 'mb-3' : 'mb-2'}`}>
            {task.tags.map((tagId) => {
              const tag = availableTags?.find((t) => t.id === tagId);
              return tag ? (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={`px-2 py-0.5 truncate ${
                    isMobile ? 'text-xs h-5 max-w-28' : 'text-xs h-4 max-w-20'
                  }`}
                >
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Subtasks section */}
        {task.subtasks.length > 0 && (
          <div className={`${isMobile ? 'mb-3' : 'mb-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSubtasksCollapsed(!isSubtasksCollapsed)}
              className={`h-6 px-1 text-muted-foreground hover:text-foreground w-full justify-start ${
                isMobile ? 'text-sm' : 'text-xs'
              }`}
            >
              {isSubtasksCollapsed ? (
                <ChevronRight className="h-3 w-3 mr-1" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/
              {task.subtasks.length})
            </Button>

            {isSubtasksCollapsed && (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.subtasks.slice(0, 3).map((subtask) => (
                  <div
                    key={getSubtaskId(subtask)}
                    className={`px-1 py-0.5 rounded text-xs bg-muted ${
                      subtask.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {subtask.title.length > 15
                      ? `${subtask.title.slice(0, 15)}...`
                      : subtask.title}
                  </div>
                ))}
                {task.subtasks.length > 3 && (
                  <div className="px-1 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                    +{task.subtasks.length - 3} more
                  </div>
                )}
              </div>
            )}

            {!isSubtasksCollapsed && (
              <div className="mt-2">
                <SubtaskListCompact
                  subtasks={task.subtasks}
                  taskId={task.id}
                  availableTags={availableTags}
                  onCreateTag={onCreateTag}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  className="space-y-1"
                  isMobile={isMobile}
                />
              </div>
            )}
          </div>
        )}

        <div
          className={`text-muted-foreground border-t ${
            isMobile ? 'text-xs pt-2' : 'text-xs pt-1'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="truncate">Created:</span>
            <span
              className="ml-2 flex-shrink-0"
              title={new Date(task.createdAt).toLocaleString()}
            >
              {formatRelativeTime(new Date(task.createdAt))}
            </span>
          </div>
          {new Date(task.updatedAt).getTime() !==
            new Date(task.createdAt).getTime() && (
            <div className="flex justify-between items-center mt-1">
              <span className="truncate">Updated:</span>
              <span
                className="ml-2 flex-shrink-0"
                title={new Date(task.updatedAt).toLocaleString()}
              >
                {formatRelativeTime(new Date(task.updatedAt))}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { InlineTaskForm } from './InlineTaskForm';
import type { Task, TaskStatus, CreateTaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { cn } from '@/lib/utils';

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
  onCreateTask?: (input: CreateTaskInput) => Promise<void>;
  isCreatingTask?: boolean;
  /** Error message for task creation in this column */
  taskCreationError?: string | null;
  /** Callback when task creation error is cleared */
  onClearTaskCreationError?: () => void;
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
  onCreateTask,
  isCreatingTask = false,
  taskCreationError,
  onClearTaskCreationError,
}: KanbanColumnProps) {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Refs for focus management
  const addTaskButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Get column-specific accent colors for buttons and forms
  const getColumnAccentColors = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return {
          button:
            'hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/50 dark:hover:border-gray-600',
          buttonText:
            'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
          border: 'border-gray-300 dark:border-gray-600',
          accent: 'border-l-gray-400 dark:border-l-gray-500',
        };
      case 'scheduled':
        return {
          button:
            'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600',
          buttonText:
            'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
          border: 'border-blue-300 dark:border-blue-600',
          accent: 'border-l-blue-400 dark:border-l-blue-500',
        };
      case 'progress':
        return {
          button:
            'hover:bg-yellow-50 hover:border-yellow-300 dark:hover:bg-yellow-900/20 dark:hover:border-yellow-600',
          buttonText:
            'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
          border: 'border-yellow-300 dark:border-yellow-600',
          accent: 'border-l-yellow-400 dark:border-l-yellow-500',
        };
      case 'completed':
        return {
          button:
            'hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:border-green-600',
          buttonText:
            'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
          border: 'border-green-300 dark:border-green-600',
          accent: 'border-l-green-400 dark:border-l-green-500',
        };
      default:
        return {
          button:
            'hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/50 dark:hover:border-gray-600',
          buttonText:
            'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
          border: 'border-gray-300 dark:border-gray-600',
          accent: 'border-l-gray-400 dark:border-l-gray-500',
        };
    }
  };

  const columnColors = getColumnAccentColors(id);

  const handleCreateTask = async (input: CreateTaskInput) => {
    if (onCreateTask) {
      try {
        setLocalError(null);
        if (onClearTaskCreationError) {
          onClearTaskCreationError();
        }
        await onCreateTask(input);
        setShowInlineForm(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create task';
        setLocalError(errorMessage);
      }
    }
  };

  const handleCancelForm = () => {
    setShowInlineForm(false);
    setLocalError(null);
    if (onClearTaskCreationError) {
      onClearTaskCreationError();
    }

    // Return focus to the "Add Task" button when form is cancelled
    setTimeout(() => {
      addTaskButtonRef.current?.focus();
    }, 0);
  };

  const handleFormError = (error: string) => {
    setLocalError(error);
  };

  // Handle keyboard navigation for the column
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key closes the form
    if (e.key === 'Escape' && showInlineForm) {
      e.preventDefault();
      handleCancelForm();
    }
  };

  // Focus management when form opens
  useEffect(() => {
    if (showInlineForm && formRef.current) {
      // Focus will be managed by the InlineTaskForm component
      const titleInput = formRef.current.querySelector(
        'input[placeholder*="title"]'
      ) as HTMLInputElement;
      if (titleInput) {
        setTimeout(() => {
          titleInput.focus();
        }, 0);
      }
    }
  }, [showInlineForm]);

  // Use external error if provided, otherwise use local error
  const displayError = taskCreationError || localError;

  // Mobile layout - full width single column with touch-optimized interactions
  if (isMobile) {
    return (
      <div
        className="flex flex-col h-full"
        role="region"
        aria-labelledby={`${id}-column-title`}
        data-testid={`column-${id}`}
      >
        {/* Hidden description for screen readers */}
        <div id={`${id}-column-description`} className="sr-only">
          {title} column containing {tasks.length}{' '}
          {tasks.length === 1 ? 'task' : 'tasks'}. Use the Add task button to
          create new tasks in this column.
        </div>

        {/* Mobile Column Header - Enhanced for touch */}
        <div className={`rounded-lg mb-4 ${color} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3
                id={`${id}-column-title`}
                className="font-semibold text-lg mb-1 truncate"
              >
                {title}
              </h3>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-background/20 ml-2 flex-shrink-0"
                aria-label={
                  isCollapsed
                    ? `Expand ${title} column`
                    : `Collapse ${title} column`
                }
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Mobile Add Task Button - Touch-optimized */}
            {onCreateTask && !showInlineForm && (
              <div className="mb-4 px-1">
                <Button
                  ref={addTaskButtonRef}
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setShowInlineForm(true);
                    setLocalError(null);
                    if (onClearTaskCreationError) {
                      onClearTaskCreationError();
                    }
                  }}
                  disabled={isCreatingTask}
                  className={cn(
                    'w-full justify-start border-2 border-dashed transition-colors',
                    'h-12 text-base font-medium rounded-xl',
                    'border-muted-foreground/30 hover:border-muted-foreground/50',
                    'active:scale-[0.98] transition-transform',
                    columnColors.button,
                    columnColors.buttonText,
                    isCreatingTask && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={`Add new task to ${title} column`}
                  aria-describedby={`${id}-column-description`}
                  data-testid="add-task-button"
                >
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Creating task...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-3" />
                      Add task in {title}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Mobile Inline Task Form - Full-width optimized */}
            {showInlineForm && onCreateTask && (
              <div
                className="mb-4 px-1"
                ref={formRef}
                onKeyDown={handleKeyDown}
              >
                <InlineTaskForm
                  onSubmit={handleCreateTask}
                  onCancel={handleCancelForm}
                  defaultStatus={id}
                  availableTags={availableTags}
                  onCreateTag={onCreateTag}
                  isSubmitting={isCreatingTask}
                  columnColors={columnColors}
                  className="mobile-form"
                  error={displayError}
                  onError={handleFormError}
                  aria-label={`Create new task in ${title} column`}
                />
              </div>
            )}

            {/* Mobile Task List Container - Enhanced spacing */}
            <div
              ref={disableDragAndDrop ? undefined : setNodeRef}
              className={cn(
                'flex-1 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-colors',
                !disableDragAndDrop && isOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/20'
              )}
              role="list"
              aria-label={`Tasks in ${title} column`}
              aria-describedby={`${id}-column-description`}
            >
              {disableDragAndDrop ? (
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-sm">No tasks yet</p>
                      <p className="text-xs mt-1">
                        Tap "Add task" to get started
                      </p>
                    </div>
                  ) : (
                    tasks.map((task) => (
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
                    ))
                  )}
                </div>
              ) : (
                <SortableContext
                  items={tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-sm">No tasks yet</p>
                        <p className="text-xs mt-1">
                          Tap "Add task" to get started
                        </p>
                      </div>
                    ) : (
                      tasks.map((task) => (
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
                      ))
                    )}
                  </div>
                </SortableContext>
              )}
            </div>
          </>
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
      role="region"
      aria-labelledby={`${id}-column-title`}
      data-testid={`column-${id}`}
    >
      {/* Hidden description for screen readers */}
      <div id={`${id}-column-description`} className="sr-only">
        {title} column containing {tasks.length}{' '}
        {tasks.length === 1 ? 'task' : 'tasks'}. Use the Add task button to
        create new tasks in this column.
      </div>

      <div
        className={`rounded-lg mb-3 lg:mb-4 ${color} ${
          isCollapsed ? 'p-2' : 'p-3 lg:p-4'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={isCollapsed ? 'hidden' : ''}>
            <h3
              id={`${id}-column-title`}
              className="font-semibold text-base lg:text-lg mb-1 truncate"
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground" aria-live="polite">
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
              aria-label={
                isCollapsed
                  ? `Expand ${title} column`
                  : `Collapse ${title} column`
              }
              aria-expanded={!isCollapsed}
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
        <>
          {/* Add Task Button for Desktop */}
          {onCreateTask && !showInlineForm && (
            <div className="mb-3">
              <Button
                ref={addTaskButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInlineForm(true);
                  setLocalError(null);
                  if (onClearTaskCreationError) {
                    onClearTaskCreationError();
                  }
                }}
                disabled={isCreatingTask}
                className={cn(
                  'w-full justify-start border-2 border-dashed transition-colors',
                  'border-muted-foreground/30 hover:border-muted-foreground/50',
                  columnColors.button,
                  columnColors.buttonText,
                  isCreatingTask && 'opacity-50 cursor-not-allowed'
                )}
                aria-label={`Add new task to ${title} column`}
                aria-describedby={`${id}-column-description`}
                data-testid="add-task-button"
              >
                {isCreatingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add task
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Inline Task Form for Desktop */}
          {showInlineForm && onCreateTask && (
            <div className="mb-3" ref={formRef} onKeyDown={handleKeyDown}>
              <InlineTaskForm
                onSubmit={handleCreateTask}
                onCancel={handleCancelForm}
                defaultStatus={id}
                availableTags={availableTags}
                onCreateTag={onCreateTag}
                isSubmitting={isCreatingTask}
                columnColors={columnColors}
                error={displayError}
                onError={handleFormError}
                aria-label={`Create new task in ${title} column`}
              />
            </div>
          )}

          <div
            ref={setNodeRef}
            className={`flex-1 min-h-[200px] lg:min-h-[250px] p-2 rounded-lg border-2 border-dashed transition-colors ${
              isOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/20'
            }`}
            role="list"
            aria-label={`Tasks in ${title} column`}
            aria-describedby={`${id}-column-description`}
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
        </>
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
          role="list"
          aria-label={`Collapsed ${title} column with ${tasks.length} tasks`}
          aria-describedby={`${id}-column-description`}
        />
      )}
    </div>
  );
}

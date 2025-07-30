import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TagSelector } from '@/features/tags';
import type {
  CreateTaskInput,
  CreateSubtaskInput,
  TaskStatus,
} from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ColumnColors {
  button: string;
  buttonText: string;
  border: string;
  accent: string;
}

interface InlineTaskFormProps {
  /** Callback function called when the form is submitted with valid task data */
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  /** Callback function called when the form is cancelled */
  onCancel: () => void;
  /** The default status for tasks created by this form (determines column placement) */
  defaultStatus: TaskStatus;
  /** Available tags for selection in the form */
  availableTags?: TagWithMetadata[];
  /** Callback function for creating new tags */
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  /** Whether the form is currently submitting (shows loading state) */
  isSubmitting?: boolean;
  /** Additional CSS classes to apply to the form container */
  className?: string;
  /** Column-specific colors for styling the form */
  columnColors?: ColumnColors;
  /** Error message to display (from parent component) */
  error?: string | null;
  /** Callback when form encounters an error */
  onError?: (error: string) => void;
  /** ARIA label for the form */
  'aria-label'?: string;
}

/**
 * InlineTaskForm - A compact task creation form optimized for inline display within kanban columns.
 *
 * This component provides a streamlined interface for creating tasks directly within specific
 * kanban columns, automatically setting the task status based on the target column. It includes
 * a collapsible advanced section for additional fields like description, tags, and subtasks.
 *
 * Features:
 * - Compact layout optimized for column display
 * - Status indicator showing target column
 * - Collapsible advanced fields section
 * - Form validation with inline error display
 * - Loading states during submission
 * - Reuses existing TaskForm validation logic
 */
export function InlineTaskForm({
  onSubmit,
  onCancel,
  defaultStatus,
  availableTags = [],
  onCreateTag,
  isSubmitting = false,
  className,
  columnColors,
  error: externalError,
  onError,
  'aria-label': ariaLabel,
}: InlineTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<CreateSubtaskInput[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
    subtasks?: { [index: number]: string };
  }>({});

  // Refs for focus management
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Use external error if provided, otherwise use internal error
  const displayError = externalError || internalError;

  // Reset form when component mounts or defaultStatus changes
  useEffect(() => {
    setTitle('');
    setDescription('');
    setTags([]);
    setSubtasks([]);
    setShowAdvanced(false);
    setInternalError(null);
    setFieldErrors({});
  }, [defaultStatus]);

  // Clear internal error when external error changes
  useEffect(() => {
    if (externalError) {
      setInternalError(null);
    }
  }, [externalError]);

  // Auto-focus title input when form mounts
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key cancels the form
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }

    // Ctrl/Cmd + Enter submits the form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (title.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    let hasErrors = false;

    // Title validation
    if (!title.trim()) {
      errors.title = 'Task title is required';
      hasErrors = true;
    } else if (title.trim().length > 200) {
      errors.title = 'Task title must be 200 characters or less';
      hasErrors = true;
    }

    // Description validation
    if (description.length > 1000) {
      errors.description = 'Task description must be 1000 characters or less';
      hasErrors = true;
    }

    // Subtask validation
    const subtaskErrors: { [index: number]: string } = {};
    subtasks.forEach((subtask, index) => {
      if (subtask.title.trim() && subtask.title.trim().length > 100) {
        subtaskErrors[index] = 'Subtask title must be 100 characters or less';
        hasErrors = true;
      }
    });

    if (Object.keys(subtaskErrors).length > 0) {
      errors.subtasks = subtaskErrors;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const taskInput: CreateTaskInput = {
        title: title.trim(),
        description: description.trim(),
        tags,
        subtasks: subtasks.filter((s) => s.title.trim()),
        status: defaultStatus,
        completed: defaultStatus === 'completed',
      };

      await onSubmit(taskInput);

      // Reset form on successful submission
      setTitle('');
      setDescription('');
      setTags([]);
      setSubtasks([]);
      setShowAdvanced(false);
      setFieldErrors({});

      // Show success toast
      toast.success(`Task created in ${getStatusDisplayName(defaultStatus)}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create task';
      setInternalError(errorMessage);

      // Notify parent component of error
      if (onError) {
        onError(errorMessage);
      }

      // Show error toast
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setSubtasks([]);
    setShowAdvanced(false);
    setInternalError(null);
    setFieldErrors({});
    onCancel();
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', tag: undefined }]);
  };

  const updateSubtask = (
    index: number,
    updates: Partial<CreateSubtaskInput>
  ) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = { ...newSubtasks[index], ...updates };
    setSubtasks(newSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  // Get status display name for the badge
  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'scheduled':
        return 'Scheduled';
      case 'progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Get status color for the badge
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-600';
      case 'progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-600';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  // Get form border styling with column-specific accent
  const getFormBorderStyling = () => {
    if (columnColors) {
      return cn(
        'border rounded-lg bg-card shadow-sm border-l-4 transition-colors',
        columnColors.border,
        columnColors.accent
      );
    }
    return 'border rounded-lg bg-card shadow-sm border-l-4 border-l-muted-foreground/50';
  };

  // Check if this is a mobile form based on className
  const isMobileForm = className?.includes('mobile-form');

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={cn(
        isMobileForm ? 'space-y-4 p-4' : 'space-y-3 p-3',
        getFormBorderStyling(),
        isMobileForm && 'rounded-xl shadow-lg',
        className
      )}
      aria-label={
        ariaLabel ||
        `Create task in ${getStatusDisplayName(defaultStatus)} column`
      }
      role="form"
    >
      {/* Status indicator - Enhanced for mobile */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            isMobileForm ? 'text-sm px-3 py-1' : 'text-xs',
            getStatusColor(defaultStatus)
          )}
        >
          Creating in: {getStatusDisplayName(defaultStatus)}
        </Badge>
        <div className="flex items-center gap-2">
          {!isMobileForm && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Ctrl+Enter to submit, Esc to cancel
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size={isMobileForm ? 'default' : 'sm'}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={isMobileForm ? 'h-8 text-sm' : 'h-6 text-xs'}
            aria-expanded={showAdvanced}
            aria-controls="advanced-fields"
            aria-label={
              showAdvanced ? 'Hide advanced fields' : 'Show advanced fields'
            }
          >
            {showAdvanced ? 'Less' : 'More'}
          </Button>
        </div>
      </div>

      {/* Error display - Enhanced for mobile */}
      {displayError && (
        <div
          className={cn(
            'text-destructive bg-destructive/10 rounded border border-destructive/20 flex items-start gap-2',
            isMobileForm ? 'text-base p-3' : 'text-sm p-2'
          )}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle
            className={cn(
              'flex-shrink-0 mt-0.5',
              isMobileForm ? 'h-4 w-4' : 'h-3 w-3'
            )}
            aria-hidden="true"
          />
          <span>{displayError}</span>
        </div>
      )}

      {/* Title input - Touch-optimized for mobile */}
      <div>
        <label htmlFor="task-title" className="sr-only">
          Task title (required)
        </label>
        <Input
          id="task-title"
          ref={titleInputRef}
          placeholder="Task title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            // Clear field error when user starts typing
            if (fieldErrors.title) {
              setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          required
          disabled={isSubmitting}
          className={cn(
            isMobileForm ? 'text-base h-12 rounded-lg px-4' : 'text-sm',
            'transition-colors focus:ring-2',
            fieldErrors.title && 'border-destructive focus:border-destructive'
          )}
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
        />
        {fieldErrors.title && (
          <p
            id="title-error"
            className={cn(
              'text-destructive mt-1 flex items-center gap-1',
              isMobileForm ? 'text-sm' : 'text-xs'
            )}
            role="alert"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {fieldErrors.title}
          </p>
        )}
      </div>

      {/* Advanced fields - Mobile-optimized layout */}
      {showAdvanced && (
        <div id="advanced-fields">
          {/* Description - Larger on mobile */}
          <div>
            <label htmlFor="task-description" className="sr-only">
              Task description (optional)
            </label>
            <Textarea
              id="task-description"
              placeholder="Task description..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                // Clear field error when user starts typing
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }
              }}
              rows={isMobileForm ? 3 : 2}
              disabled={isSubmitting}
              className={cn(
                'resize-none transition-colors focus:ring-2',
                isMobileForm ? 'text-base rounded-lg px-4 py-3' : 'text-sm',
                fieldErrors.description &&
                  'border-destructive focus:border-destructive'
              )}
              aria-invalid={!!fieldErrors.description}
              aria-describedby={
                fieldErrors.description ? 'description-error' : undefined
              }
            />
            {fieldErrors.description && (
              <p
                id="description-error"
                className={cn(
                  'text-destructive mt-1 flex items-center gap-1',
                  isMobileForm ? 'text-sm' : 'text-xs'
                )}
                role="alert"
              >
                <AlertCircle
                  className="h-3 w-3 flex-shrink-0"
                  aria-hidden="true"
                />
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Tags - Mobile-optimized */}
          <div>
            <label className="sr-only">Task tags (optional)</label>
            <TagSelector
              selectedTags={tags}
              availableTags={availableTags}
              onTagsChange={setTags}
              onCreateTag={onCreateTag}
              placeholder="Select or create tags..."
            />
          </div>

          {/* Subtasks - Mobile-optimized layout */}
          <div className={cn(isMobileForm ? 'space-y-3' : 'space-y-2')}>
            <div className="flex items-center justify-between">
              <label
                className={cn(
                  'font-medium text-muted-foreground',
                  isMobileForm ? 'text-sm' : 'text-xs'
                )}
              >
                Subtasks
              </label>
              <Button
                type="button"
                variant="ghost"
                size={isMobileForm ? 'default' : 'sm'}
                onClick={addSubtask}
                disabled={isSubmitting}
                className={isMobileForm ? 'h-8 text-sm' : 'h-6 text-xs'}
                aria-label="Add new subtask"
              >
                <Plus
                  className={cn(isMobileForm ? 'h-4 w-4 mr-2' : 'h-3 w-3 mr-1')}
                  aria-hidden="true"
                />
                Add
              </Button>
            </div>

            {subtasks.map((subtask, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-2 items-center',
                  isMobileForm && 'flex-col space-y-2'
                )}
              >
                <div className={cn(isMobileForm ? 'w-full' : 'flex-1')}>
                  <label htmlFor={`subtask-${index}`} className="sr-only">
                    Subtask {index + 1} title
                  </label>
                  <Input
                    id={`subtask-${index}`}
                    placeholder="Subtask title"
                    value={subtask.title}
                    onChange={(e) => {
                      updateSubtask(index, { title: e.target.value });
                      // Clear field error when user starts typing
                      if (fieldErrors.subtasks?.[index]) {
                        setFieldErrors((prev) => {
                          const newSubtaskErrors = { ...prev.subtasks };
                          delete newSubtaskErrors[index];
                          return {
                            ...prev,
                            subtasks:
                              Object.keys(newSubtaskErrors).length > 0
                                ? newSubtaskErrors
                                : undefined,
                          };
                        });
                      }
                    }}
                    disabled={isSubmitting}
                    className={cn(
                      isMobileForm
                        ? 'text-base h-10 rounded-lg px-3 w-full'
                        : 'text-sm h-8 w-full',
                      fieldErrors.subtasks?.[index] &&
                        'border-destructive focus:border-destructive'
                    )}
                    aria-invalid={!!fieldErrors.subtasks?.[index]}
                    aria-describedby={
                      fieldErrors.subtasks?.[index]
                        ? `subtask-${index}-error`
                        : undefined
                    }
                  />
                  {fieldErrors.subtasks?.[index] && (
                    <p
                      id={`subtask-${index}-error`}
                      className={cn(
                        'text-destructive mt-1 flex items-center gap-1',
                        isMobileForm ? 'text-xs' : 'text-xs'
                      )}
                      role="alert"
                    >
                      <AlertCircle
                        className="h-3 w-3 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {fieldErrors.subtasks[index]}
                    </p>
                  )}
                </div>
                <div
                  className={cn(isMobileForm ? 'flex w-full gap-2' : 'w-24')}
                >
                  <div className={cn(isMobileForm ? 'flex-1' : 'w-full')}>
                    <TagSelector
                      selectedTags={subtask.tag ? [subtask.tag] : []}
                      availableTags={availableTags}
                      onTagsChange={(selectedTagIds) =>
                        updateSubtask(index, {
                          tag: selectedTagIds.slice(0, 1)[0] || undefined,
                        })
                      }
                      onCreateTag={onCreateTag}
                      placeholder="Tag..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size={isMobileForm ? 'default' : 'sm'}
                    onClick={() => removeSubtask(index)}
                    disabled={isSubmitting}
                    className={cn(
                      'text-destructive',
                      isMobileForm ? 'h-10 w-10 p-0' : 'h-6 w-6 p-0'
                    )}
                    aria-label={`Remove subtask ${index + 1}`}
                  >
                    <X
                      className={cn(isMobileForm ? 'h-4 w-4' : 'h-3 w-3')}
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - Touch-optimized for mobile */}
      <div className={cn('flex gap-3 pt-2', isMobileForm && 'pt-4')}>
        <Button
          type="submit"
          size={isMobileForm ? 'lg' : 'sm'}
          disabled={isSubmitting || !title.trim()}
          className={cn(
            'flex-1 transition-all active:scale-[0.98]',
            isMobileForm && 'h-12 text-base font-medium rounded-lg',
            columnColors && [
              // Use column-specific colors for the submit button
              columnColors.button.replace('hover:', ''),
              columnColors.buttonText.replace('hover:', ''),
              'border',
              columnColors.border,
            ]
          )}
          variant={columnColors ? 'outline' : 'default'}
          aria-describedby={displayError ? 'form-error' : undefined}
        >
          {isSubmitting && (
            <Loader2
              className={cn(
                'animate-spin mr-2',
                isMobileForm ? 'h-4 w-4' : 'h-3 w-3 mr-1'
              )}
              aria-hidden="true"
            />
          )}
          {isSubmitting ? 'Creating...' : 'Add Task'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobileForm ? 'lg' : 'sm'}
          onClick={handleCancel}
          disabled={isSubmitting}
          className={cn(
            'transition-all active:scale-[0.98]',
            isMobileForm && 'h-12 text-base rounded-lg px-6'
          )}
          aria-label="Cancel task creation"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/features/tags';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
}

export function EditTaskModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  availableTags = [],
  onCreateTag,
}: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset submitting state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (taskInput: CreateTaskInput) => {
    if (!task || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updates: UpdateTaskInput = {
        title: taskInput.title,
        description: taskInput.description,
        tags: taskInput.tags,
        subtasks: taskInput.subtasks?.map((subtask, index) => {
          // Preserve existing subtask's completion state if it exists
          const existingSubtask = task.subtasks?.[index];
          return {
            title: subtask.title,
            tag: subtask.tag,
            completed: existingSubtask?.completed ?? false,
            createdAt: existingSubtask?.createdAt ?? new Date(),
            updatedAt: new Date(),
          };
        }),
      };

      onUpdate(task.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!task) return null;

  const initialData: CreateTaskInput = {
    title: task.title,
    description: task.description,
    tags: task.tags,
    subtasks:
      task.subtasks?.map((subtask) => ({
        title: subtask.title,
        tag: subtask.tag,
      })) || [],
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <TaskForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? 'Updating...' : 'Update Task'}
          availableTags={availableTags}
          onCreateTag={onCreateTag}
          variant="modal"
        />
      </DialogContent>
    </Dialog>
  );
}

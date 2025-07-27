import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/TagSelector';
import type { CreateTaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/hooks/useTags';

interface TaskFormProps {
  onSubmit: (task: CreateTaskInput) => void;
  onCancel?: () => void;
  initialData?: CreateTaskInput;
  submitLabel?: string;
  availableTags?: TagWithMetadata[];
  variant?: 'default' | 'modal';
}

export const TaskForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Add Task',
  availableTags = [],
  variant = 'default',
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds || []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTagIds(initialData.tagIds || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tagIds,
    });

    // Reset form only if not editing
    if (!initialData) {
      setTitle('');
      setDescription('');
      setTagIds([]);
    }
  };

  const isModal = variant === 'modal';

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isModal ? 'space-y-4' : 'space-y-4 p-4 border rounded-lg bg-card'
      }
    >
      <div>
        <Input
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus={isModal}
        />
      </div>

      <div>
        <Textarea
          placeholder="Task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <TagSelector
          selectedTagIds={tagIds}
          availableTags={availableTags}
          onTagIdsChange={setTagIds}
          placeholder="Select or create tags..."
        />
      </div>

      <div className={`flex gap-2 ${isModal ? 'justify-end pt-4' : ''}`}>
        {isModal && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
        {!isModal && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

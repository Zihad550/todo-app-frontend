import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from '@/components/TagSelector';
import type { CreateTaskInput, CreateSubtaskInput } from '@/types/task';
import type { TagWithMetadata } from '@/hooks/useTags';
import { Plus, X } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: CreateTaskInput) => void;
  onCancel?: () => void;
  initialData?: CreateTaskInput;
  submitLabel?: string;
  availableTags?: TagWithMetadata[];
  onCreateTag?: (name: string) => Promise<TagWithMetadata>;
  variant?: 'default' | 'modal';
}

export const TaskForm = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Add Task',
  availableTags = [],
  onCreateTag,
  variant = 'default',
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [subtasks, setSubtasks] = useState<CreateSubtaskInput[]>(
    initialData?.subtasks || []
  );

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTags(initialData.tags || []);
      setSubtasks(initialData.subtasks || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags,
      subtasks: subtasks.filter((s) => s.title.trim()),
    });

    // Reset form only if not editing
    if (!initialData) {
      setTitle('');
      setDescription('');
      setTags([]);
      setSubtasks([]);
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
          selectedTags={tags}
          availableTags={availableTags}
          onTagsChange={setTags}
          onCreateTag={onCreateTag}
          placeholder="Select or create tags..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Subtasks</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setSubtasks([...subtasks, { title: '', tag: undefined }])
            }
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add subtask
          </Button>
        </div>

        {subtasks.map((subtask, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Subtask title"
              value={subtask.title}
              onChange={(e) => {
                const newSubtasks = [...subtasks];
                newSubtasks[index] = { ...subtask, title: e.target.value };
                setSubtasks(newSubtasks);
              }}
              className="flex-1"
            />
            <div className="w-32">
              <TagSelector
                selectedTags={subtask.tag ? [subtask.tag] : []}
                availableTags={availableTags}
                onTagsChange={(selectedTagIds) => {
                  const newSubtasks = [...subtasks];
                  newSubtasks[index] = {
                    ...subtask,
                    tag: selectedTagIds.slice(0, 1)[0] || undefined,
                  };
                  setSubtasks(newSubtasks);
                }}
                onCreateTag={onCreateTag}
                placeholder="Select tag..."
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubtasks(subtasks.filter((_, i) => i !== index));
              }}
              className="h-8 w-8 p-0 text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
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

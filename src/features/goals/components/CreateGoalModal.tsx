import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type CreateGoalInput, GoalCategory } from '@/types/goal';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateGoalInput) => void;
  parentId?: string;
}

const categoryOptions = [
  { value: GoalCategory.FRONTEND, label: 'Frontend' },
  { value: GoalCategory.BACKEND, label: 'Backend' },
  { value: GoalCategory.DATABASE, label: 'Database' },
  { value: GoalCategory.DEVOPS, label: 'DevOps' },
  { value: GoalCategory.TOOLS, label: 'Tools' },
  { value: GoalCategory.SOFT_SKILLS, label: 'Soft Skills' },
  { value: GoalCategory.ARCHITECTURE, label: 'Architecture' },
];

const resourceTypes = [
  'documentation',
  'tutorial',
  'course',
  'book',
  'video',
  'practice',
] as const;

export function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
  parentId,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState<CreateGoalInput>({
    title: '',
    description: '',
    category: GoalCategory.FRONTEND,
    estimatedHours: undefined,
    resources: [],
    notes: '',
  });

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'documentation' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      ...formData,
      parentId,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: GoalCategory.FRONTEND,
      estimatedHours: undefined,
      resources: [],
      notes: '',
    });
    setNewResource({
      title: '',
      url: '',
      type: 'documentation',
    });
  };

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    setFormData((prev) => ({
      ...prev,
      resources: [...(prev.resources || []), { ...newResource }],
    }));

    setNewResource({
      title: '',
      url: '',
      type: 'documentation',
    });
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parentId ? 'Create Sub-Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., React Hooks Mastery"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: GoalCategory) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what you want to learn and achieve..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="1"
              value={formData.estimatedHours || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedHours: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                }))
              }
              placeholder="e.g., 40"
            />
          </div>

          <div className="space-y-4">
            <Label>Resources</Label>

            {/* Add new resource */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Resource title"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <Select
                  value={newResource.type}
                  onValueChange={(value: typeof newResource.type) =>
                    setNewResource((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="https://..."
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addResource}
                  size="sm"
                  disabled={
                    !newResource.title.trim() || !newResource.url.trim()
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Resource list */}
            {formData.resources && formData.resources.length > 0 && (
              <div className="space-y-2">
                {formData.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {resource.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {resource.url}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {resource.type}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes or context..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
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
import {
  type Goal,
  GoalCategory,
  type UpdateGoalInput,
  type Resource,
} from '@/types/goal';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: UpdateGoalInput) => void;
  goal: Goal;
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

export function EditGoalModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
}: EditGoalModalProps) {
  const [formData, setFormData] = useState<UpdateGoalInput>({});
  const [resources, setResources] = useState<Resource[]>([]);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'documentation' as const,
  });

  useEffect(() => {
    if (isOpen && goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        estimatedHours: goal.estimatedHours,
        actualHours: goal.actualHours,
        notes: goal.notes,
      });
      setResources([...goal.resources]);
    }
  }, [isOpen, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      resources,
    });
  };

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    const resource: Resource = {
      id: Date.now().toString() + Math.random(),
      ...newResource,
      completed: false,
    };

    setResources((prev) => [...prev, resource]);
    setNewResource({
      title: '',
      url: '',
      type: 'documentation',
    });
  };

  const removeResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleResourceCompleted = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Goal title"
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
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Goal description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours</Label>
              <Input
                id="actualHours"
                type="number"
                min="0"
                value={formData.actualHours || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    actualHours: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="e.g., 35"
              />
            </div>
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
            {resources.length > 0 && (
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={resource.completed}
                        onChange={() => toggleResourceCompleted(resource.id)}
                        className="rounded"
                      />
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
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(resource.id)}
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
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes or context..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

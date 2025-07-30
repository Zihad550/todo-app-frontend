import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type {
  CreateRoutineInput,
  CreateRoutineStepInput,
} from '@/types/routine';
import { RoutineFrequency } from '@/types/routine';
import { cn } from '@/lib/utils';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routine: CreateRoutineInput) => void;
}

const ROUTINE_COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f97316', // orange
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function CreateRoutineModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateRoutineModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: RoutineFrequency.DAILY,
    color: ROUTINE_COLORS[0],
    icon: 'Target',
  });
  const [steps, setSteps] = useState<CreateRoutineStepInput[]>([
    { title: '', description: '', estimatedMinutes: 5, order: 0 },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validSteps = steps.filter((step) => step.title.trim());
    if (validSteps.length === 0) return;

    onSubmit({
      ...formData,
      steps: validSteps.map((step, index) => ({ ...step, order: index })),
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      frequency: RoutineFrequency.DAILY,
      color: ROUTINE_COLORS[0],
      icon: 'Target',
    });
    setSteps([{ title: '', description: '', estimatedMinutes: 5, order: 0 }]);
    onClose();
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { title: '', description: '', estimatedMinutes: 5, order: prev.length },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (
    index: number,
    field: keyof CreateRoutineStepInput,
    value: unknown
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const totalEstimatedTime = steps.reduce(
    (sum, step) => sum + (step.estimatedMinutes || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create New Routine
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Routine Name</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Morning Energizer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: RoutineFrequency) =>
                    setFormData((prev) => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoutineFrequency.DAILY}>
                      Daily
                    </SelectItem>
                    <SelectItem value={RoutineFrequency.WEEKLY}>
                      Weekly
                    </SelectItem>
                    <SelectItem value={RoutineFrequency.MONTHLY}>
                      Monthly
                    </SelectItem>
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
                placeholder="Describe what this routine helps you achieve..."
                rows={2}
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex space-x-2">
                {ROUTINE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      formData.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Routine Steps</Label>
              <div className="text-sm text-muted-foreground">
                Total: {totalEstimatedTime} minutes
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="border-2 transition-all duration-200 hover:shadow-md"
                  style={{ borderColor: `${formData.color}30` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2 mt-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: formData.color }}
                        >
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <Input
                              value={step.title}
                              onChange={(e) =>
                                updateStep(index, 'title', e.target.value)
                              }
                              placeholder="Step title"
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={step.estimatedMinutes}
                              onChange={(e) =>
                                updateStep(
                                  index,
                                  'estimatedMinutes',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                              max="180"
                              className="w-16"
                            />
                            <span className="text-sm text-muted-foreground">
                              min
                            </span>
                          </div>
                        </div>

                        <Textarea
                          value={step.description}
                          onChange={(e) =>
                            updateStep(index, 'description', e.target.value)
                          }
                          placeholder="Optional description..."
                          rows={2}
                        />
                      </div>

                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.title.trim() ||
                steps.filter((s) => s.title.trim()).length === 0
              }
              style={{ backgroundColor: formData.color }}
            >
              Create Routine
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { CreateHabitInput } from '@/types/habit';
import { HabitType, HabitFrequency } from '@/types/habit';
import { cn } from '@/lib/utils';

interface CreateHabitModalProps {
  onCreateHabit: (input: CreateHabitInput) => void;
  className?: string;
}

const HABIT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

const HABIT_ICONS = [
  'Target',
  'Droplets',
  'Dumbbell',
  'BookOpen',
  'Coffee',
  'Moon',
  'Sun',
  'Heart',
  'Brain',
  'Zap',
  'Leaf',
  'Music',
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function CreateHabitModal({
  onCreateHabit,
  className,
}: CreateHabitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateHabitInput>({
    title: '',
    description: '',
    type: HabitType.BOOLEAN,
    frequency: HabitFrequency.DAILY,
    color: HABIT_COLORS[0],
    icon: HABIT_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onCreateHabit(formData);
    setIsOpen(false);
    setFormData({
      title: '',
      description: '',
      type: HabitType.BOOLEAN,
      frequency: HabitFrequency.DAILY,
      color: HABIT_COLORS[0],
      icon: HABIT_ICONS[0],
    });
  };

  const handleCustomDayToggle = (day: number) => {
    const currentDays = formData.customDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    setFormData({ ...formData, customDays: newDays });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn('', className)}>
          <Plus className="h-4 w-4 mr-2" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Drink water, Exercise, Read"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div>
            <Label>Habit Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: HabitType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={HabitType.BOOLEAN}>
                  Yes/No (Simple completion)
                </SelectItem>
                <SelectItem value={HabitType.NUMERIC}>
                  Number (Count something)
                </SelectItem>
                <SelectItem value={HabitType.DURATION}>
                  Duration (Track time)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.type === HabitType.NUMERIC ||
            formData.type === HabitType.DURATION) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, target: Number(e.target.value) })
                  }
                  placeholder="e.g., 8"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder={
                    formData.type === HabitType.DURATION ? 'minutes' : 'glasses'
                  }
                />
              </div>
            </div>
          )}

          <div>
            <Label>Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: HabitFrequency) =>
                setFormData({
                  ...formData,
                  frequency: value,
                  customDays: undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={HabitFrequency.DAILY}>Daily</SelectItem>
                <SelectItem value={HabitFrequency.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={HabitFrequency.CUSTOM}>
                  Custom Days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === HabitFrequency.CUSTOM && (
            <div>
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Badge
                    key={day.value}
                    variant={
                      formData.customDays?.includes(day.value)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => handleCustomDayToggle(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full border-2',
                    formData.color === color
                      ? 'border-foreground'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {HABIT_ICONS.map((icon) => (
                <Button
                  key={icon}
                  type="button"
                  variant={formData.icon === icon ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, icon })}
                  className="h-10"
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Habit, HabitEntry } from '@/types/habit';
import { HabitType, HabitStatus } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  todayEntry?: HabitEntry;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onLogEntry: (habitId: string, value?: number, notes?: string) => void;
  className?: string;
}

export function HabitCard({
  habit,
  todayEntry,
  onUpdate,
  onDelete,
  onLogEntry,
  className,
}: HabitCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [logValue, setLogValue] = useState<string>('');
  const [logNotes, setLogNotes] = useState<string>('');

  const isCompleted = todayEntry?.completed || false;
  const currentValue = todayEntry?.value || 0;
  const progress = habit.target ? (currentValue / habit.target) * 100 : 0;

  const handleQuickLog = () => {
    if (habit.type === HabitType.BOOLEAN) {
      onLogEntry(habit.id);
    } else {
      setIsLogging(true);
    }
  };

  const handleSubmitLog = () => {
    const value =
      habit.type === HabitType.BOOLEAN ? undefined : Number(logValue);
    onLogEntry(habit.id, value, logNotes || undefined);
    setIsLogging(false);
    setLogValue('');
    setLogNotes('');
  };

  const handleStatusChange = (newStatus: HabitStatus) => {
    onUpdate(habit.id, { status: newStatus });
  };

  const getStatusColor = (status: HabitStatus) => {
    switch (status) {
      case HabitStatus.ACTIVE:
        return 'bg-green-500';
      case HabitStatus.PAUSED:
        return 'bg-yellow-500';
      case HabitStatus.ARCHIVED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderHabitValue = () => {
    if (habit.type === HabitType.BOOLEAN) {
      return (
        <div className="flex items-center space-x-2">
          <Badge variant={isCompleted ? 'default' : 'secondary'}>
            {isCompleted ? 'Completed' : 'Not completed'}
          </Badge>
        </div>
      );
    }

    if (habit.type === HabitType.NUMERIC || habit.type === HabitType.DURATION) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {currentValue} / {habit.target} {habit.unit}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      );
    }
  };

  if (isLogging) {
    return (
      <Card
        className={cn('', className)}
        style={{ borderLeft: `4px solid ${habit.color}` }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{habit.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLogging(false)}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(habit.type === HabitType.NUMERIC ||
            habit.type === HabitType.DURATION) && (
            <div>
              <label className="text-sm font-medium">
                Value ({habit.unit})
              </label>
              <Input
                type="number"
                value={logValue}
                onChange={(e) => setLogValue(e.target.value)}
                placeholder={`Enter ${habit.unit}`}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Add any notes..."
              className="mt-1"
              rows={2}
            />
          </div>
          <Button onClick={handleSubmitLog} className="w-full">
            Log Entry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn('', className)}
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{habit.title}</h3>
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                getStatusColor(habit.status)
              )}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => toast.info('Edit functionality coming soon')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {habit.status === HabitStatus.ACTIVE && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(HabitStatus.PAUSED)}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              {habit.status === HabitStatus.PAUSED && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(HabitStatus.ACTIVE)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleStatusChange(HabitStatus.ARCHIVED)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(habit.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {habit.description && (
          <p className="text-sm text-muted-foreground">{habit.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {renderHabitValue()}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Streak: {habit.streak} days</span>
          <span>Best: {habit.longestStreak} days</span>
        </div>

        {todayEntry?.notes && (
          <div className="text-sm">
            <span className="font-medium">Today's notes: </span>
            <span className="text-muted-foreground">{todayEntry.notes}</span>
          </div>
        )}

        <Button
          onClick={handleQuickLog}
          disabled={isCompleted && habit.type === HabitType.BOOLEAN}
          className="w-full"
          variant={isCompleted ? 'secondary' : 'default'}
        >
          {isCompleted && habit.type === HabitType.BOOLEAN
            ? 'Completed Today ✓'
            : habit.type === HabitType.BOOLEAN
            ? 'Mark Complete'
            : 'Log Entry'}
        </Button>
      </CardContent>
    </Card>
  );
}

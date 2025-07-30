import { HabitCard } from './HabitCard';
import type { Habit } from '@/types/habit';
import { HabitStatus } from '@/types/habit';
import { cn } from '@/lib/utils';

interface HabitListProps {
  habits: Habit[];
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onLogEntry: (habitId: string, value?: number, notes?: string) => void;
  getTodayEntry: (habitId: string) => any;
  className?: string;
}

export function HabitList({
  habits,
  onUpdate,
  onDelete,
  onLogEntry,
  getTodayEntry,
  className,
}: HabitListProps) {
  const activeHabits = habits.filter(
    (habit) => habit.status === HabitStatus.ACTIVE
  );
  const pausedHabits = habits.filter(
    (habit) => habit.status === HabitStatus.PAUSED
  );
  const archivedHabits = habits.filter(
    (habit) => habit.status === HabitStatus.ARCHIVED
  );

  if (habits.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No habits yet</p>
          <p>Create your first habit to start tracking your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {activeHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            Active Habits
            <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {activeHabits.length}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayEntry={getTodayEntry(habit.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLogEntry={onLogEntry}
              />
            ))}
          </div>
        </div>
      )}

      {pausedHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            Paused Habits
            <span className="ml-2 text-sm bg-yellow-500 text-white px-2 py-1 rounded-full">
              {pausedHabits.length}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pausedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayEntry={getTodayEntry(habit.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLogEntry={onLogEntry}
              />
            ))}
          </div>
        </div>
      )}

      {archivedHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            Archived Habits
            <span className="ml-2 text-sm bg-gray-500 text-white px-2 py-1 rounded-full">
              {archivedHabits.length}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayEntry={getTodayEntry(habit.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLogEntry={onLogEntry}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

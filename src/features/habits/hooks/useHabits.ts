import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type {
  Habit,
  HabitEntry,
  CreateHabitInput,
  UpdateHabitInput,
  HabitStats,
} from '@/types/habit';
import { HabitStatus, HabitFrequency, HabitType } from '@/types/habit';

// Mock data for development
const mockHabits: Habit[] = [
  {
    id: '1',
    title: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    type: HabitType.NUMERIC,
    frequency: HabitFrequency.DAILY,
    target: 8,
    unit: 'glasses',
    status: HabitStatus.ACTIVE,
    color: '#3b82f6',
    icon: 'Droplets',
    streak: 7,
    longestStreak: 12,
    totalCompletions: 45,
    entries: [
      {
        id: '1-1',
        habitId: '1',
        date: new Date(),
        completed: true,
        value: 6,
        createdAt: new Date(),
      },
      {
        id: '1-2',
        habitId: '1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completed: true,
        value: 8,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Morning Exercise',
    description: 'Start the day with physical activity',
    type: HabitType.DURATION,
    frequency: HabitFrequency.DAILY,
    target: 30,
    unit: 'minutes',
    status: HabitStatus.ACTIVE,
    color: '#f59e0b',
    icon: 'Dumbbell',
    streak: 5,
    longestStreak: 15,
    totalCompletions: 28,
    entries: [
      {
        id: '2-1',
        habitId: '2',
        date: new Date(),
        completed: false,
        createdAt: new Date(),
      },
      {
        id: '2-2',
        habitId: '2',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completed: true,
        value: 35,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Read Books',
    description: 'Daily reading habit',
    type: HabitType.BOOLEAN,
    frequency: HabitFrequency.DAILY,
    status: HabitStatus.ACTIVE,
    color: '#10b981',
    icon: 'BookOpen',
    streak: 3,
    longestStreak: 21,
    totalCompletions: 67,
    entries: [
      {
        id: '3-1',
        habitId: '3',
        date: new Date(),
        completed: true,
        notes: 'Read 2 chapters of "Atomic Habits"',
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHabits(mockHabits);
      setIsLoading(false);
    }, 500);
  }, []);

  const createHabit = async (input: CreateHabitInput): Promise<void> => {
    try {
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...input,
        status: HabitStatus.ACTIVE,
        streak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        entries: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setHabits((prev) => [...prev, newHabit]);
      toast.success('Habit created successfully');
    } catch (error) {
      toast.error('Failed to create habit');
      throw error;
    }
  };

  const updateHabit = async (
    id: string,
    updates: UpdateHabitInput
  ): Promise<void> => {
    try {
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                ...updates,
                updatedAt: new Date(),
              }
            : habit
        )
      );
      toast.success('Habit updated successfully');
    } catch (error) {
      toast.error('Failed to update habit');
      throw error;
    }
  };

  const deleteHabit = async (id: string): Promise<void> => {
    try {
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
      toast.success('Habit deleted successfully');
    } catch (error) {
      toast.error('Failed to delete habit');
      throw error;
    }
  };

  const logHabitEntry = async (
    habitId: string,
    value?: number,
    notes?: string
  ): Promise<void> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== habitId) return habit;

          // Check if entry for today already exists
          const existingEntryIndex = habit.entries.findIndex((entry) => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
          });

          const newEntry: HabitEntry = {
            id: `${habitId}-${Date.now()}`,
            habitId,
            date: today,
            completed: true,
            value,
            notes,
            createdAt: new Date(),
          };

          let updatedEntries;
          if (existingEntryIndex >= 0) {
            // Update existing entry
            updatedEntries = [...habit.entries];
            updatedEntries[existingEntryIndex] = newEntry;
          } else {
            // Add new entry
            updatedEntries = [...habit.entries, newEntry];
          }

          // Calculate new streak
          const sortedEntries = updatedEntries
            .filter((entry) => entry.completed)
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

          let newStreak = 0;
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);

          for (const entry of sortedEntries) {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor(
              (currentDate.getTime() - entryDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            if (daysDiff === newStreak) {
              newStreak++;
            } else {
              break;
            }
          }

          return {
            ...habit,
            entries: updatedEntries,
            streak: newStreak,
            longestStreak: Math.max(habit.longestStreak, newStreak),
            totalCompletions: updatedEntries.filter((entry) => entry.completed)
              .length,
            updatedAt: new Date(),
          };
        })
      );

      toast.success('Habit logged successfully! 🎉');
    } catch (error) {
      toast.error('Failed to log habit');
      throw error;
    }
  };

  const getHabitStats = (): HabitStats => {
    const activeHabits = habits.filter(
      (habit) => habit.status === HabitStatus.ACTIVE
    );
    const totalCompletions = habits.reduce(
      (sum, habit) => sum + habit.totalCompletions,
      0
    );
    const totalPossibleCompletions = habits.reduce((sum, habit) => {
      const daysSinceCreation = Math.floor(
        (Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + Math.max(1, daysSinceCreation);
    }, 0);

    const completionRate =
      totalPossibleCompletions > 0
        ? (totalCompletions / totalPossibleCompletions) * 100
        : 0;

    const averageStreak =
      habits.length > 0
        ? habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length
        : 0;

    const longestStreak = Math.max(
      ...habits.map((habit) => habit.longestStreak),
      0
    );

    // Calculate completions this week and month
    const now = new Date();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completionsThisWeek = habits.reduce((sum, habit) => {
      return (
        sum +
        habit.entries.filter(
          (entry) => entry.completed && new Date(entry.date) >= weekStart
        ).length
      );
    }, 0);

    const completionsThisMonth = habits.reduce((sum, habit) => {
      return (
        sum +
        habit.entries.filter(
          (entry) => entry.completed && new Date(entry.date) >= monthStart
        ).length
      );
    }, 0);

    return {
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
      completionRate: Math.round(completionRate),
      averageStreak: Math.round(averageStreak * 10) / 10,
      longestStreak,
      completionsThisWeek,
      completionsThisMonth,
    };
  };

  const getTodayEntry = (habitId: string): HabitEntry | undefined => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habit.entries.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
  };

  return {
    habits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabitEntry,
    getHabitStats,
    getTodayEntry,
  };
}

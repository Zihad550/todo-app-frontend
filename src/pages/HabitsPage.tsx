import { useLoaderData } from 'react-router';
import {
  CreateHabitModal,
  HabitList,
  HabitStats,
  useHabits,
} from '@/features/habits';

export function HabitsPage() {
  const loaderData = useLoaderData();
  const {
    habits,
    isLoading,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabitEntry,
    getHabitStats,
    getTodayEntry,
  } = useHabits();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading habits...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getHabitStats();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground mt-1">
            Track your daily habits and build lasting routines
          </p>
        </div>
        <CreateHabitModal onCreateHabit={createHabit} />
      </div>

      <HabitStats stats={stats} />

      <HabitList
        habits={habits}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
        onLogEntry={logHabitEntry}
        getTodayEntry={getTodayEntry}
      />
    </div>
  );
}

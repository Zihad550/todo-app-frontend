import { useGoals, GoalTree } from '@/features/goals';

export function GoalsPage() {
  const {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleExpanded,
    getGoalProgress,
    canStartGoal,
    isLoading,
  } = useGoals();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Fullstack Developer Learning Path
          </h1>
          <p className="text-muted-foreground">
            Track your journey to becoming a fullstack developer with structured
            learning goals
          </p>
        </div>

        <GoalTree
          goals={goals}
          onGoalCreate={createGoal}
          onGoalUpdate={updateGoal}
          onGoalDelete={deleteGoal}
          onToggleExpanded={toggleExpanded}
          getGoalProgress={getGoalProgress}
          canStartGoal={canStartGoal}
        />
      </div>
    </div>
  );
}

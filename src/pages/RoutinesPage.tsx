import { useLoaderData } from 'react-router';
import { RoutineList, useRoutines } from '@/features/routines';

export function RoutinesPage() {
  useLoaderData();

  const {
    routines,
    isLoading,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    startRoutineSession,
    completeStep,
    completeRoutineSession,
  } = useRoutines();

  return (
    <div className="container mx-auto px-4 py-8">
      <RoutineList
        routines={routines}
        isLoading={isLoading}
        onCreateRoutine={createRoutine}
        onUpdateRoutine={updateRoutine}
        onDeleteRoutine={deleteRoutine}
        onStartSession={startRoutineSession}
        onStepComplete={completeStep}
        onSessionComplete={completeRoutineSession}
      />
    </div>
  );
}

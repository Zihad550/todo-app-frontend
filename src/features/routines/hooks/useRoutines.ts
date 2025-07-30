import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type {
  Routine,
  CreateRoutineInput,
  UpdateRoutineInput,
} from '@/types/routine';
import { RoutineStatus, RoutineFrequency } from '@/types/routine';

// Mock data for development
const mockRoutines: Routine[] = [
  {
    id: '1',
    title: 'Morning Energizer',
    description: 'Start your day with energy and focus',
    frequency: RoutineFrequency.DAILY,
    steps: [
      {
        id: '1-1',
        title: 'Hydrate',
        description: 'Drink a large glass of water',
        estimatedMinutes: 2,
        completed: false,
        order: 0,
      },
      {
        id: '1-2',
        title: 'Stretch',
        description: '5-minute full body stretch',
        estimatedMinutes: 5,
        completed: false,
        order: 1,
      },
      {
        id: '1-3',
        title: 'Meditation',
        description: 'Mindful breathing exercise',
        estimatedMinutes: 10,
        completed: false,
        order: 2,
      },
    ],
    status: RoutineStatus.ACTIVE,
    color: '#f59e0b',
    icon: 'Sun',
    totalEstimatedMinutes: 17,
    completedSessions: 12,
    streak: 5,
    lastCompletedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextScheduledAt: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Deep Work Session',
    description: 'Focused productivity routine',
    frequency: RoutineFrequency.WEEKLY,
    customDays: [1, 3, 5], // Monday, Wednesday, Friday
    steps: [
      {
        id: '2-1',
        title: 'Environment Setup',
        description: 'Clear desk, close distractions',
        estimatedMinutes: 5,
        completed: false,
        order: 0,
      },
      {
        id: '2-2',
        title: 'Priority Review',
        description: 'Review and prioritize tasks',
        estimatedMinutes: 10,
        completed: false,
        order: 1,
      },
      {
        id: '2-3',
        title: 'Focus Block',
        description: '90-minute deep work session',
        estimatedMinutes: 90,
        completed: false,
        order: 2,
      },
    ],
    status: RoutineStatus.ACTIVE,
    color: '#3b82f6',
    icon: 'Brain',
    totalEstimatedMinutes: 105,
    completedSessions: 8,
    streak: 3,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRoutines(mockRoutines);
      setIsLoading(false);
    }, 500);
  }, []);

  const createRoutine = async (input: CreateRoutineInput): Promise<void> => {
    try {
      const newRoutine: Routine = {
        id: Date.now().toString(),
        ...input,
        steps: input.steps.map((step, index) => ({
          ...step,
          id: `${Date.now()}-${index}`,
          completed: false,
        })),
        status: RoutineStatus.ACTIVE,
        totalEstimatedMinutes: input.steps.reduce(
          (sum, step) => sum + step.estimatedMinutes,
          0
        ),
        completedSessions: 0,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRoutines((prev) => [...prev, newRoutine]);
      toast.success('Routine created successfully');
    } catch (error) {
      toast.error('Failed to create routine');
      throw error;
    }
  };

  const updateRoutine = async (
    id: string,
    updates: UpdateRoutineInput
  ): Promise<void> => {
    try {
      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === id
            ? {
                ...routine,
                ...updates,
                updatedAt: new Date(),
                totalEstimatedMinutes: updates.steps
                  ? updates.steps.reduce(
                      (sum, step) => sum + step.estimatedMinutes,
                      0
                    )
                  : routine.totalEstimatedMinutes,
              }
            : routine
        )
      );
      toast.success('Routine updated successfully');
    } catch (error) {
      toast.error('Failed to update routine');
      throw error;
    }
  };

  const deleteRoutine = async (id: string): Promise<void> => {
    try {
      setRoutines((prev) => prev.filter((routine) => routine.id !== id));
      toast.success('Routine deleted successfully');
    } catch (error) {
      toast.error('Failed to delete routine');
      throw error;
    }
  };

  const startRoutineSession = async (routineId: string): Promise<void> => {
    try {
      // Reset all steps to incomplete for new session
      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) => ({
                  ...step,
                  completed: false,
                })),
                updatedAt: new Date(),
              }
            : routine
        )
      );
      toast.success('Routine session started');
    } catch (error) {
      toast.error('Failed to start routine session');
      throw error;
    }
  };

  const completeStep = async (
    routineId: string,
    stepId: string
  ): Promise<void> => {
    try {
      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) =>
                  step.id === stepId ? { ...step, completed: true } : step
                ),
                updatedAt: new Date(),
              }
            : routine
        )
      );
    } catch (error) {
      toast.error('Failed to complete step');
      throw error;
    }
  };

  const completeRoutineSession = async (routineId: string): Promise<void> => {
    try {
      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                completedSessions: routine.completedSessions + 1,
                streak: routine.streak + 1,
                lastCompletedAt: new Date(),
                updatedAt: new Date(),
              }
            : routine
        )
      );
      toast.success('Routine session completed! 🎉');
    } catch (error) {
      toast.error('Failed to complete routine session');
      throw error;
    }
  };

  return {
    routines,
    isLoading,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    startRoutineSession,
    completeStep,
    completeRoutineSession,
  };
}

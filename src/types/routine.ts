export enum RoutineFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum RoutineStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export interface RoutineStep {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  completed: boolean;
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  frequency: RoutineFrequency;
  customDays?: number[];
  steps: RoutineStep[];
  status: RoutineStatus;
  color: string;
  icon: string;
  totalEstimatedMinutes: number;
  completedSessions: number;
  streak: number;
  lastCompletedAt?: Date;
  nextScheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoutineStepInput {
  title: string;
  description?: string;
  estimatedMinutes: number;
  order: number;
}

export interface CreateRoutineInput {
  title: string;
  description: string;
  frequency: RoutineFrequency;
  customDays?: number[];
  steps: CreateRoutineStepInput[];
  color: string;
  icon: string;
}

export interface UpdateRoutineInput {
  title?: string;
  description?: string;
  frequency?: RoutineFrequency;
  customDays?: number[];
  steps?: RoutineStep[];
  status?: RoutineStatus;
  color?: string;
  icon?: string;
}

export interface RoutineSession {
  id: string;
  routineId: string;
  startedAt: Date;
  completedAt?: Date;
  completedSteps: string[];
  totalTimeSpent: number;
  notes?: string;
}

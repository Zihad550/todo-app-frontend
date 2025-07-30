export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum HabitStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum HabitType {
  BOOLEAN = 'boolean', // Yes/No completion
  NUMERIC = 'numeric', // Track a number (e.g., glasses of water)
  DURATION = 'duration', // Track time spent
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
  value?: number; // For numeric/duration habits
  notes?: string;
  createdAt: Date;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  type: HabitType;
  frequency: HabitFrequency;
  customDays?: number[]; // Days of week (0-6) for custom frequency
  target?: number; // Target value for numeric/duration habits
  unit?: string; // Unit for numeric habits (e.g., "glasses", "minutes")
  status: HabitStatus;
  color: string;
  icon: string;
  streak: number; // Current streak
  longestStreak: number;
  totalCompletions: number;
  entries: HabitEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitInput {
  title: string;
  description: string;
  type: HabitType;
  frequency: HabitFrequency;
  customDays?: number[];
  target?: number;
  unit?: string;
  color: string;
  icon: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  type?: HabitType;
  frequency?: HabitFrequency;
  customDays?: number[];
  target?: number;
  unit?: string;
  status?: HabitStatus;
  color?: string;
  icon?: string;
}

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completionRate: number;
  averageStreak: number;
  longestStreak: number;
  completionsThisWeek: number;
  completionsThisMonth: number;
}

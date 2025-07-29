export enum TaskStatus {
  BACKLOG = 'backlog',
  SCHEDULED = 'scheduled',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
}

export interface Tag {
  id: string;
  name: string;
}

export interface Subtask {
  title: string;
  tag?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  completed: boolean;
  status: TaskStatus;
  position: number; // Position within the status column (0-based index)
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubtaskInput {
  title: string;
  tag?: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  tag?: string;
  completed?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  tags: string[];
  position?: number;
  subtasks?: CreateSubtaskInput[];
  status?: TaskStatus;
  completed?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  tags?: string[];
  completed?: boolean;
  status?: TaskStatus;
  position?: number;
  subtasks?: Subtask[];
}

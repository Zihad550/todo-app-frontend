export enum TaskStatus {
  BACKLOG = 'backlog',
  SCHEDULED = 'scheduled',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  completed: boolean;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  tags: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  tags?: string[];
  completed?: boolean;
  status?: TaskStatus;
}

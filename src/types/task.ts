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

export interface Task {
  id: string;
  title: string;
  description: string;
  tagIds: string[];
  completed: boolean;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  tagIds: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  tagIds?: string[];
  completed?: boolean;
  status?: TaskStatus;
}

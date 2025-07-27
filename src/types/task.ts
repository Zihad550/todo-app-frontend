export type TaskStatus = 'backlog' | 'scheduled' | 'progress' | 'completed';

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
